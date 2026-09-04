package md.gov.epetitie.service;

import md.gov.epetitie.dto.*;
import md.gov.epetitie.mapper.PetitionMapper;
import md.gov.epetitie.model.*;
import md.gov.epetitie.repository.*;
import md.gov.epetitie.repository.specification.PetitionSpecification;
import md.gov.epetitie.security.UserPrincipal;
import md.gov.epetitie.util.PdfReceiptGenerator;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.HexFormat;
import java.util.List;
import java.util.Random;

@Service
public class PetitionService {

    private final PetitionRepository petitionRepository;
    private final PetitionSignatureRepository signatureRepository;
    private final PetitionHistoryRepository historyRepository;
    private final UserRepository userRepository;
    private final PetitionMapper petitionMapper;
    private final GeminiAiService geminiAiService;

    public PetitionService(PetitionRepository petitionRepository,
                           PetitionSignatureRepository signatureRepository,
                           PetitionHistoryRepository historyRepository,
                           UserRepository userRepository,
                           PetitionMapper petitionMapper,
                           GeminiAiService geminiAiService) {
        this.petitionRepository = petitionRepository;
        this.signatureRepository = signatureRepository;
        this.historyRepository = historyRepository;
        this.userRepository = userRepository;
        this.petitionMapper = petitionMapper;
        this.geminiAiService = geminiAiService;
    }

    @Transactional
    public PetitionResponseDto createPetition(PetitionCreateDto dto, UserPrincipal currentUser) {
        User author = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Utilizatorul autor nu a fost găsit."));

        boolean isInitiative = Boolean.TRUE.equals(dto.isPublicInitiative());
        int threshold = isInitiative ? (dto.signatureThreshold() != null && dto.signatureThreshold() > 0 ? dto.signatureThreshold() : 50) : 0;
        PetitionStatus initialStatus = isInitiative ? PetitionStatus.COLLECTING_SIGNATURES : PetitionStatus.SUBMITTED;
        PetitionPriority priority = dto.priority() != null ? dto.priority() : PetitionPriority.NORMAL;

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime submissionDate = isInitiative ? null : now;
        LocalDateTime deadlineDate = isInitiative ? null : now.plusDays(30);

        String trackingNumber = generateTrackingNumber();

        // Perform Gemini AI Triage
        AiTriageResultDto triage = geminiAiService.performAutomatedTriage(dto.title(), dto.description());

        Petition petition = Petition.builder()
                .trackingNumber(trackingNumber)
                .author(author)
                .isPublicInitiative(isInitiative)
                .signatureThreshold(threshold)
                .currentSignatureCount(1) // Author automatically signs
                .category(dto.category() != null ? dto.category() : triage.recommendedCategory())
                .title(dto.title())
                .description(dto.description())
                .status(initialStatus)
                .priority(triage.suggestedPriority() != null ? triage.suggestedPriority() : priority)
                .submissionDate(submissionDate)
                .deadlineDate(deadlineDate)
                .aiTriageSummary(triage.executiveBriefingSummary())
                .build();

        Petition savedPetition = petitionRepository.save(petition);

        // Record initial signature for author
        String authorSigHash = generateSignatureHash(author.getId(), savedPetition.getId(), now);
        PetitionSignature initialSig = PetitionSignature.builder()
                .petition(savedPetition)
                .citizen(author)
                .signedAt(now)
                .signatureHash(authorSigHash)
                .build();
        signatureRepository.save(initialSig);

        // Audit History
        PetitionHistory history = PetitionHistory.builder()
                .petition(savedPetition)
                .fromStatus(null)
                .toStatus(initialStatus)
                .note(isInitiative ? "Inițiativă publică creată. Colectare semnături inițiată." : "Petiție individuală depusă și înregistrată automat.")
                .actor(author)
                .build();
        historyRepository.save(history);

        PetitionResponseDto response = petitionMapper.toResponseDto(savedPetition);
        return new PetitionResponseDto(
                response.id(), response.trackingNumber(), response.title(), response.description(),
                response.category(), response.status(), response.priority(), response.isPublicInitiative(),
                response.signatureThreshold(), response.currentSignatureCount(), response.submissionDate(),
                response.deadlineDate(), response.authorId(), response.authorName(), response.assignedOfficerId(),
                response.assignedOfficerName(), response.aiTriageSummary(), true, response.daysRemaining()
        );
    }

    @Transactional
    public PetitionResponseDto updatePetition(Long petitionId, PetitionUpdateDto dto, UserPrincipal currentUser) {
        Petition petition = petitionRepository.findById(petitionId)
                .orElseThrow(() -> new IllegalArgumentException("Petiția nu a fost găsită."));

        if (!petition.getAuthor().getId().equals(currentUser.getId())) {
            throw new IllegalStateException("Nu aveți permisiunea de a edita această petiție.");
        }

        if (petition.getStatus() != PetitionStatus.SUBMITTED && petition.getStatus() != PetitionStatus.COLLECTING_SIGNATURES) {
            throw new IllegalStateException("Petiția nu mai poate fi editată în stadiul curent.");
        }

        petition.setTitle(dto.title());
        petition.setDescription(dto.description());
        petition.setCategory(dto.category());

        Petition saved = petitionRepository.save(petition);

        PetitionHistory history = PetitionHistory.builder()
                .petition(saved)
                .fromStatus(petition.getStatus())
                .toStatus(petition.getStatus())
                .note("Petiție editată de cetățean.")
                .actor(petition.getAuthor())
                .build();
        historyRepository.save(history);

        PetitionResponseDto response = petitionMapper.toResponseDto(saved);
        return new PetitionResponseDto(
                response.id(), response.trackingNumber(), response.title(), response.description(),
                response.category(), response.status(), response.priority(), response.isPublicInitiative(),
                response.signatureThreshold(), response.currentSignatureCount(), response.submissionDate(),
                response.deadlineDate(), response.authorId(), response.authorName(), response.assignedOfficerId(),
                response.assignedOfficerName(), response.aiTriageSummary(), true, response.daysRemaining()
        );
    }

    @Transactional
    public void deletePetition(Long petitionId, UserPrincipal currentUser) {
        Petition petition = petitionRepository.findById(petitionId)
                .orElseThrow(() -> new IllegalArgumentException("Petiția nu a fost găsită."));

        if (!petition.getAuthor().getId().equals(currentUser.getId())) {
            throw new IllegalStateException("Nu aveți permisiunea de a șterge această petiție.");
        }

        if (petition.getStatus() != PetitionStatus.SUBMITTED && petition.getStatus() != PetitionStatus.COLLECTING_SIGNATURES) {
            throw new IllegalStateException("Petiția nu mai poate fi ștearsă în stadiul curent.");
        }

        signatureRepository.deleteAllByPetitionId(petitionId);
        historyRepository.deleteAllByPetitionId(petitionId);
        petitionRepository.delete(petition);
    }

    @Transactional
    public SignInitiativeDto signInitiative(Long petitionId, UserPrincipal currentUser) {
        Petition petition = petitionRepository.findById(petitionId)
                .orElseThrow(() -> new IllegalArgumentException("Inițiativa publică nu a fost găsită."));

        if (!Boolean.TRUE.equals(petition.getIsPublicInitiative())) {
            throw new IllegalStateException("Această petiție este individuală și nu acceptă semnături publice.");
        }

        if (petition.getStatus() != PetitionStatus.COLLECTING_SIGNATURES) {
            throw new IllegalStateException("Inițiativa nu mai este în faza de colectare a semnăturilor.");
        }

        User citizen = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Utilizatorul nu a fost găsit."));

        if (signatureRepository.existsByPetitionIdAndCitizenId(petitionId, citizen.getId())) {
            throw new IllegalStateException("Ați semnat deja această inițiativă publică.");
        }

        LocalDateTime now = LocalDateTime.now();
        String sigHash = generateSignatureHash(citizen.getId(), petition.getId(), now);

        PetitionSignature signature = PetitionSignature.builder()
                .petition(petition)
                .citizen(citizen)
                .signedAt(now)
                .signatureHash(sigHash)
                .build();
        signatureRepository.save(signature);

        petition.setCurrentSignatureCount(petition.getCurrentSignatureCount() + 1);

        // Check if signature threshold reached
        if (petition.getCurrentSignatureCount() >= petition.getSignatureThreshold()) {
            PetitionStatus oldStatus = petition.getStatus();
            petition.setStatus(PetitionStatus.SUBMITTED);
            petition.setSubmissionDate(now);
            petition.setDeadlineDate(now.plusDays(30));

            PetitionHistory history = PetitionHistory.builder()
                    .petition(petition)
                    .fromStatus(oldStatus)
                    .toStatus(PetitionStatus.SUBMITTED)
                    .note("Pragul de " + petition.getSignatureThreshold() + " semnături a fost atins. Inițiativa a fost depusă oficial.")
                    .actor(citizen)
                    .build();
            historyRepository.save(history);
        }

        Petition updatedPetition = petitionRepository.save(petition);
        PetitionResponseDto pDto = petitionMapper.toResponseDto(updatedPetition);
        PetitionResponseDto enrichedDto = new PetitionResponseDto(
                pDto.id(), pDto.trackingNumber(), pDto.title(), pDto.description(),
                pDto.category(), pDto.status(), pDto.priority(), pDto.isPublicInitiative(),
                pDto.signatureThreshold(), pDto.currentSignatureCount(), pDto.submissionDate(),
                pDto.deadlineDate(), pDto.authorId(), pDto.authorName(), pDto.assignedOfficerId(),
                pDto.assignedOfficerName(), pDto.aiTriageSummary(), true, pDto.daysRemaining()
        );

        return new SignInitiativeDto(petition.getId(), sigHash, updatedPetition.getCurrentSignatureCount(), enrichedDto);
    }

    @Transactional(readOnly = true)
    public Page<PetitionResponseDto> getPublicInitiatives(String searchTerm, PetitionCategory category, Pageable pageable, UserPrincipal currentUser) {
        Specification<Petition> spec = PetitionSpecification.filter(category, PetitionStatus.COLLECTING_SIGNATURES, null, true, searchTerm, null, null);
        Page<Petition> page = petitionRepository.findAll(spec, pageable);

        return page.map(p -> {
            PetitionResponseDto dto = petitionMapper.toResponseDto(p);
            boolean signed = currentUser != null && signatureRepository.existsByPetitionIdAndCitizenId(p.getId(), currentUser.getId());
            return new PetitionResponseDto(
                    dto.id(), dto.trackingNumber(), dto.title(), dto.description(),
                    dto.category(), dto.status(), dto.priority(), dto.isPublicInitiative(),
                    dto.signatureThreshold(), dto.currentSignatureCount(), dto.submissionDate(),
                    dto.deadlineDate(), dto.authorId(), dto.authorName(), dto.assignedOfficerId(),
                    dto.assignedOfficerName(), dto.aiTriageSummary(), signed, dto.daysRemaining()
            );
        });
    }

    @Transactional(readOnly = true)
    public Page<PetitionResponseDto> getCitizenAuthoredPetitions(UserPrincipal currentUser, Pageable pageable) {
        Page<Petition> page = petitionRepository.findByAuthorId(currentUser.getId(), pageable);
        return page.map(petitionMapper::toResponseDto);
    }

    @Transactional(readOnly = true)
    public Page<PetitionResponseDto> getCitizenSupportedInitiatives(UserPrincipal currentUser, Pageable pageable) {
        List<Long> petitionIds = signatureRepository.findByCitizenId(currentUser.getId())
                .stream()
                .map(sig -> sig.getPetition().getId())
                .toList();

        if (petitionIds.isEmpty()) {
            return Page.empty(pageable);
        }

        Specification<Petition> spec = (root, query, cb) -> root.get("id").in(petitionIds);
        return petitionRepository.findAll(spec, pageable).map(p -> {
            PetitionResponseDto dto = petitionMapper.toResponseDto(p);
            return new PetitionResponseDto(
                    dto.id(), dto.trackingNumber(), dto.title(), dto.description(),
                    dto.category(), dto.status(), dto.priority(), dto.isPublicInitiative(),
                    dto.signatureThreshold(), dto.currentSignatureCount(), dto.submissionDate(),
                    dto.deadlineDate(), dto.authorId(), dto.authorName(), dto.assignedOfficerId(),
                    dto.assignedOfficerName(), dto.aiTriageSummary(), true, dto.daysRemaining()
            );
        });
    }

    @Transactional(readOnly = true)
    public Page<PetitionResponseDto> searchPetitionsForOfficer(
            PetitionCategory category,
            PetitionStatus status,
            PetitionPriority priority,
            Boolean isPublicInitiative,
            String searchTerm,
            Long assignedOfficerId,
            Pageable pageable
    ) {
        Specification<Petition> spec = PetitionSpecification.filter(category, status, priority, isPublicInitiative, searchTerm, null, assignedOfficerId);
        return petitionRepository.findAll(spec, pageable).map(petitionMapper::toResponseDto);
    }

    @Transactional(readOnly = true)
    public PetitionDetailDto getPetitionDetails(Long id, UserPrincipal currentUser) {
        Petition petition = petitionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Petiția cu ID " + id + " nu a fost găsită."));

        List<PetitionHistory> history = historyRepository.findByPetitionIdOrderByCreatedAtDesc(id);
        petition.setHistory(history);

        PetitionDetailDto detail = petitionMapper.toDetailDto(petition);
        boolean signed = currentUser != null && signatureRepository.existsByPetitionIdAndCitizenId(id, currentUser.getId());

        return new PetitionDetailDto(
                detail.id(), detail.trackingNumber(), detail.title(), detail.description(),
                detail.category(), detail.status(), detail.priority(), detail.isPublicInitiative(),
                detail.signatureThreshold(), detail.currentSignatureCount(), detail.submissionDate(),
                detail.deadlineDate(), detail.authorId(), detail.authorName(), detail.authorIdnp(),
                detail.assignedOfficerId(), detail.assignedOfficerName(), detail.resolutionText(),
                detail.aiTriageSummary(), signed, detail.daysRemaining(), detail.history(), detail.createdAt()
        );
    }

    @Transactional
    public PetitionDetailDto updatePetitionStatusByOfficer(Long petitionId, PetitionStatusUpdateDto updateDto, UserPrincipal currentUser) {
        Petition petition = petitionRepository.findById(petitionId)
                .orElseThrow(() -> new IllegalArgumentException("Petiția nu a fost găsită."));

        User actor = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Utilizatorul nu a fost găsit."));

        PetitionStatus oldStatus = petition.getStatus();
        petition.setStatus(updateDto.newStatus());

        if (updateDto.resolutionText() != null && !updateDto.resolutionText().isBlank()) {
            petition.setResolutionText(updateDto.resolutionText());
        }

        if (updateDto.assignedOfficerId() != null) {
            User officer = userRepository.findById(updateDto.assignedOfficerId())
                    .orElseThrow(() -> new IllegalArgumentException("Inspectorul desemnat nu a fost găsit."));
            petition.setAssignedOfficer(officer);
        } else if (petition.getAssignedOfficer() == null) {
            petition.setAssignedOfficer(actor);
        }

        Petition updatedPetition = petitionRepository.save(petition);

        // Record History
        PetitionHistory history = PetitionHistory.builder()
                .petition(updatedPetition)
                .fromStatus(oldStatus)
                .toStatus(updateDto.newStatus())
                .note(updateDto.note() != null ? updateDto.note() : "Status actualizat de către " + actor.getFullName())
                .actor(actor)
                .build();
        historyRepository.save(history);

        return getPetitionDetails(petitionId, currentUser);
    }

    @Transactional(readOnly = true)
    public byte[] generatePetitionReceiptPdf(Long petitionId) {
        Petition petition = petitionRepository.findById(petitionId)
                .orElseThrow(() -> new IllegalArgumentException("Petiția nu a fost găsită."));

        String verificationUrl = "https://servicii.gov.md/petitie/verify/" + petition.getTrackingNumber();
        return PdfReceiptGenerator.generatePetitionReceiptPdf(petition, verificationUrl);
    }

    private String generateTrackingNumber() {
        int currentYear = Year.now().getValue();
        int randomSeq = new Random().nextInt(90000) + 10000;
        return "PET-" + currentYear + "-" + randomSeq;
    }

    private String generateSignatureHash(Long citizenId, Long petitionId, LocalDateTime timestamp) {
        try {
            String raw = citizenId + ":" + petitionId + ":" + timestamp.toString();
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            return "SIG-HASH-" + System.currentTimeMillis();
        }
    }
}
