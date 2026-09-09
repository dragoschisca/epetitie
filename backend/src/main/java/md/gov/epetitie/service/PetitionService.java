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
    private final RoleRepository roleRepository;
    private final PetitionMapper petitionMapper;
    private final GeminiAiService geminiAiService;
    private final OtpVerificationService otpVerificationService;

    public PetitionService(PetitionRepository petitionRepository,
                           PetitionSignatureRepository signatureRepository,
                           PetitionHistoryRepository historyRepository,
                           UserRepository userRepository,
                           RoleRepository roleRepository,
                           PetitionMapper petitionMapper,
                           GeminiAiService geminiAiService,
                           OtpVerificationService otpVerificationService) {
        this.petitionRepository = petitionRepository;
        this.signatureRepository = signatureRepository;
        this.historyRepository = historyRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.petitionMapper = petitionMapper;
        this.geminiAiService = geminiAiService;
        this.otpVerificationService = otpVerificationService;
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

        // Auto-assign first available officer in system if present
        User defaultOfficer = userRepository.findAll().stream()
                .filter(u -> u.getRoles() != null && u.getRoles().stream().anyMatch(r -> r.getName() == RoleName.ROLE_OFFICER))
                .findFirst()
                .orElse(null);

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
                .assignedOfficer(defaultOfficer)
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

    @Transactional
    public SignInitiativeDto unsignInitiative(Long petitionId, UserPrincipal currentUser) {
        Petition petition = petitionRepository.findById(petitionId)
                .orElseThrow(() -> new IllegalArgumentException("Inițiativa publică nu a fost găsită."));

        User citizen = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Utilizatorul nu a fost găsit."));

        if (!signatureRepository.existsByPetitionIdAndCitizenId(petitionId, citizen.getId())) {
            throw new IllegalStateException("Nu ați semnat această inițiativă publică.");
        }

        signatureRepository.deleteByPetitionIdAndCitizenId(petitionId, citizen.getId());
        petition.setCurrentSignatureCount(Math.max(0, petition.getCurrentSignatureCount() - 1));

        Petition updatedPetition = petitionRepository.save(petition);
        PetitionResponseDto pDto = petitionMapper.toResponseDto(updatedPetition);
        PetitionResponseDto enrichedDto = new PetitionResponseDto(
                pDto.id(), pDto.trackingNumber(), pDto.title(), pDto.description(),
                pDto.category(), pDto.status(), pDto.priority(), pDto.isPublicInitiative(),
                pDto.signatureThreshold(), pDto.currentSignatureCount(), pDto.submissionDate(),
                pDto.deadlineDate(), pDto.authorId(), pDto.authorName(), pDto.assignedOfficerId(),
                pDto.assignedOfficerName(), pDto.aiTriageSummary(), false, pDto.daysRemaining()
        );

        return new SignInitiativeDto(petition.getId(), "", updatedPetition.getCurrentSignatureCount(), enrichedDto);
    }

    public md.gov.epetitie.dto.GuestOtpResponseDto sendGuestOtp(Long petitionId, md.gov.epetitie.dto.GuestOtpRequestDto dto) {
        Petition petition = petitionRepository.findById(petitionId)
                .orElseThrow(() -> new IllegalArgumentException("Inițiativa publică nu a fost găsită."));

        String code = otpVerificationService.generateAndStoreOtp(dto.target());
        String msg = "Codul de verificare de 5 cifre a fost generat cu succes pentru " + dto.target() + ".";
        return new md.gov.epetitie.dto.GuestOtpResponseDto(msg, dto.target(), code);
    }

    @Transactional
    public SignInitiativeDto signGuestInitiative(Long petitionId, md.gov.epetitie.dto.GuestSignRequestDto dto) {
        boolean validOtp = otpVerificationService.validateOtp(dto.contact(), dto.otpCode());
        if (!validOtp) {
            throw new IllegalArgumentException("Codul de verificare introdus este incorect sau a expirat.");
        }

        Petition petition = petitionRepository.findById(petitionId)
                .orElseThrow(() -> new IllegalArgumentException("Inițiativa publică nu a fost găsită."));

        if (!Boolean.TRUE.equals(petition.getIsPublicInitiative())) {
            throw new IllegalStateException("Această petiție este individuală și nu acceptă semnături publice.");
        }

        String contact = dto.contact().trim().toLowerCase();
        User guestUser = userRepository.findByEmail(contact)
                .orElseGet(() -> userRepository.findByUsername(contact)
                .orElseGet(() -> createGuestUser(dto.fullName(), contact)));

        if (signatureRepository.existsByPetitionIdAndCitizenId(petitionId, guestUser.getId())) {
            throw new IllegalStateException("Acest contact a semnat deja această inițiativă publică.");
        }

        LocalDateTime now = LocalDateTime.now();
        String sigHash = generateSignatureHash(guestUser.getId(), petition.getId(), now);

        PetitionSignature signature = PetitionSignature.builder()
                .petition(petition)
                .citizen(guestUser)
                .signedAt(now)
                .signatureHash(sigHash)
                .build();
        signatureRepository.save(signature);

        petition.setCurrentSignatureCount(petition.getCurrentSignatureCount() + 1);

        if (petition.getCurrentSignatureCount() >= petition.getSignatureThreshold() && petition.getStatus() == PetitionStatus.COLLECTING_SIGNATURES) {
            PetitionStatus oldStatus = petition.getStatus();
            petition.setStatus(PetitionStatus.SUBMITTED);
            petition.setSubmissionDate(now);
            petition.setDeadlineDate(now.plusDays(30));

            PetitionHistory history = PetitionHistory.builder()
                    .petition(petition)
                    .fromStatus(oldStatus)
                    .toStatus(PetitionStatus.SUBMITTED)
                    .note("Pragul de " + petition.getSignatureThreshold() + " semnături a fost atins prin susținere publică.")
                    .actor(guestUser)
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

    @Transactional
    public SignInitiativeDto unsignGuestInitiative(Long petitionId, md.gov.epetitie.dto.GuestUnsignRequestDto dto) {
        boolean validOtp = otpVerificationService.validateOtp(dto.contact(), dto.otpCode());
        if (!validOtp) {
            throw new IllegalArgumentException("Codul de verificare introdus este incorect sau a expirat.");
        }

        Petition petition = petitionRepository.findById(petitionId)
                .orElseThrow(() -> new IllegalArgumentException("Inițiativa publică nu a fost găsită."));

        String contact = dto.contact().trim().toLowerCase();
        User guestUser = userRepository.findByEmail(contact)
                .orElseGet(() -> userRepository.findByUsername(contact).orElse(null));

        if (guestUser == null || !signatureRepository.existsByPetitionIdAndCitizenId(petitionId, guestUser.getId())) {
            throw new IllegalStateException("Nu s-a găsit nicio semnătură înregistrată pentru acest contact.");
        }

        signatureRepository.deleteByPetitionIdAndCitizenId(petitionId, guestUser.getId());
        petition.setCurrentSignatureCount(Math.max(0, petition.getCurrentSignatureCount() - 1));

        Petition updatedPetition = petitionRepository.save(petition);
        PetitionResponseDto pDto = petitionMapper.toResponseDto(updatedPetition);
        PetitionResponseDto enrichedDto = new PetitionResponseDto(
                pDto.id(), pDto.trackingNumber(), pDto.title(), pDto.description(),
                pDto.category(), pDto.status(), pDto.priority(), pDto.isPublicInitiative(),
                pDto.signatureThreshold(), pDto.currentSignatureCount(), pDto.submissionDate(),
                pDto.deadlineDate(), pDto.authorId(), pDto.authorName(), pDto.assignedOfficerId(),
                pDto.assignedOfficerName(), pDto.aiTriageSummary(), false, pDto.daysRemaining()
        );

        return new SignInitiativeDto(petition.getId(), "", updatedPetition.getCurrentSignatureCount(), enrichedDto);
    }

    private User createGuestUser(String fullName, String contact) {
        String username = contact.contains("@") ? contact : "phone_" + contact.replaceAll("[^0-9]", "");
        String email = contact.contains("@") ? contact : username + "@guest.epetitie.gov.md";
        String[] parts = fullName.trim().split("\\s+", 2);
        String firstName = parts[0];
        String lastName = parts.length > 1 ? parts[1] : "";

        Role citizenRole = roleRepository.findByName(RoleName.ROLE_CITIZEN).orElse(null);

        User guest = User.builder()
                .username(username)
                .email(email)
                .passwordHash("$2a$10$GuestDummyPasswordNotUsedForAuth1234567890")
                .firstName(firstName)
                .lastName(lastName)
                .roles(citizenRole != null ? java.util.Set.of(citizenRole) : java.util.Collections.emptySet())
                .build();

        return userRepository.save(guest);
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

    @Transactional
    public PetitionDetailDto getPetitionDetails(Long id, UserPrincipal currentUser) {
        Petition petition = petitionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Petiția cu ID " + id + " nu a fost găsită."));

        if (petition.getAssignedOfficer() == null && currentUser != null && currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_OFFICER"))) {
            User officer = userRepository.findById(currentUser.getId()).orElse(null);
            if (officer != null) {
                petition.setAssignedOfficer(officer);
                petition = petitionRepository.save(petition);
            }
        }

        List<PetitionHistory> history = historyRepository.findByPetitionIdOrderByCreatedAtDesc(id);
        // Do not set on petition to avoid orphanRemoval hibernate exception

        PetitionDetailDto detail = petitionMapper.toDetailDto(petition);
        boolean signed = currentUser != null && signatureRepository.existsByPetitionIdAndCitizenId(id, currentUser.getId());

        String resText = detail.resolutionText();
        if ((resText == null || resText.isBlank()) && (petition.getStatus() == PetitionStatus.RESOLVED || petition.getStatus() == PetitionStatus.REJECTED)) {
            resText = (petition.getStatus() == PetitionStatus.RESOLVED ?
                    "Petiția dumneavoastră a fost examinată favorabil de către autoritățile competente. Solicitarea a fost aprobată și transmisă spre punere în aplicare conform Codului Administrativ al Republicii Moldova." :
                    "În urma examinării dosarului administrativ, s-a constatat neîndeplinirea condițiilor legale de admisibilitate, motiv pentru care solicitarea a fost respinsă motivat conform prevederilor Codului Administrativ.");
        }

        return new PetitionDetailDto(
                detail.id(), detail.trackingNumber(), detail.title(), detail.description(),
                detail.category(), detail.status(), detail.priority(), detail.isPublicInitiative(),
                detail.signatureThreshold(), detail.currentSignatureCount(), detail.submissionDate(),
                detail.deadlineDate(), detail.authorId(), detail.authorName(), detail.authorIdnp(),
                detail.assignedOfficerId(), detail.assignedOfficerName(), resText,
                detail.aiTriageSummary(), signed, detail.daysRemaining(), petitionMapper.toHistoryDtoList(history), detail.createdAt()
        );
    }

    @Transactional
    public PetitionDetailDto updatePetitionStatusByOfficer(Long petitionId, PetitionStatusUpdateDto updateDto, UserPrincipal currentUser) {
        Petition petition = petitionRepository.findById(petitionId)
                .orElseThrow(() -> new IllegalArgumentException("Petiția nu a fost găsită."));

        User actor = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Utilizatorul nu a fost găsit."));

        PetitionStatus oldStatus = petition.getStatus();
        PetitionStatus targetStatus = updateDto.newStatus() != null ? updateDto.newStatus() : oldStatus;
        petition.setStatus(targetStatus);

        if (updateDto.resolutionText() != null && !updateDto.resolutionText().isBlank()) {
            petition.setResolutionText(updateDto.resolutionText());
        } else if ((targetStatus == PetitionStatus.RESOLVED || targetStatus == PetitionStatus.REJECTED) && (petition.getResolutionText() == null || petition.getResolutionText().isBlank())) {
            String defaultResolution = (targetStatus == PetitionStatus.RESOLVED ?
                    "Petiția dumneavoastră a fost examinată favorabil de către autoritățile competente. Solicitarea a fost aprobată și transmisă spre punere în aplicare conform Codului Administrativ al Republicii Moldova." :
                    "În urma examinării dosarului administrativ, s-a constatat neîndeplinirea condițiilor legale de admisibilitate, motiv pentru care solicitarea a fost respinsă motivat conform prevederilor Codului Administrativ.");
            petition.setResolutionText(defaultResolution);
        }

        User previousOfficer = petition.getAssignedOfficer();
        if (updateDto.assignedOfficerId() != null) {
            User officer = userRepository.findById(updateDto.assignedOfficerId())
                    .orElseThrow(() -> new IllegalArgumentException("Inspectorul desemnat nu a fost găsit."));
            petition.setAssignedOfficer(officer);
        } else if (petition.getAssignedOfficer() == null) {
            petition.setAssignedOfficer(actor);
        }

        Petition updatedPetition = petitionRepository.save(petition);

        String note = updateDto.note();
        if (note == null || note.isBlank()) {
            if (previousOfficer == null || (updatedPetition.getAssignedOfficer() != null && !updatedPetition.getAssignedOfficer().getId().equals(previousOfficer.getId()))) {
                note = "Petiție repartizată inspectorului " + updatedPetition.getAssignedOfficer().getFullName();
            } else {
                note = "Actualizare efectuală de către " + actor.getFullName();
            }
        }

        // Record History
        PetitionHistory history = PetitionHistory.builder()
                .petition(updatedPetition)
                .fromStatus(oldStatus)
                .toStatus(targetStatus)
                .note(note)
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
