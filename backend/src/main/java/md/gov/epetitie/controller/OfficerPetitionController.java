package md.gov.epetitie.controller;

import jakarta.validation.Valid;
import md.gov.epetitie.dto.*;
import md.gov.epetitie.model.PetitionCategory;
import md.gov.epetitie.model.PetitionPriority;
import md.gov.epetitie.model.PetitionStatus;

import md.gov.epetitie.security.UserPrincipal;
import md.gov.epetitie.service.GeminiAiService;
import md.gov.epetitie.service.PetitionService;
import md.gov.epetitie.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/officer/petitions")
@PreAuthorize("hasRole('OFFICER')")
public class OfficerPetitionController {

    private final PetitionService petitionService;
    private final GeminiAiService geminiAiService;
    private final UserService userService;

    public OfficerPetitionController(PetitionService petitionService, GeminiAiService geminiAiService, UserService userService) {
        this.petitionService = petitionService;
        this.geminiAiService = geminiAiService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<Page<PetitionResponseDto>> searchPetitions(
            @RequestParam(required = false) PetitionCategory category,
            @RequestParam(required = false) PetitionStatus status,
            @RequestParam(required = false) PetitionPriority priority,
            @RequestParam(required = false) Boolean isPublicInitiative,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long assignedOfficerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<PetitionResponseDto> result = petitionService.searchPetitionsForOfficer(
                category, status, priority, isPublicInitiative, search, assignedOfficerId, pageRequest
        );
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PetitionDetailDto> getPetitionDetails(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        PetitionDetailDto detail = petitionService.getPetitionDetails(id, currentUser);
        return ResponseEntity.ok(detail);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PetitionDetailDto> updatePetitionStatus(
            @PathVariable Long id,
            @Valid @RequestBody PetitionStatusUpdateDto updateDto,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        PetitionDetailDto updated = petitionService.updatePetitionStatusByOfficer(id, updateDto, currentUser);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/ai-draft-resolution")
    public ResponseEntity<AiResolutionDraftDto> generateAiDraftResolution(
            @PathVariable Long id,
            @RequestBody(required = false) md.gov.epetitie.dto.AiDraftRequestDto requestDto,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        PetitionDetailDto detail = petitionService.getPetitionDetails(id, currentUser);
        // Build mock/real petition object for Gemini AI resolution drafting
        md.gov.epetitie.model.Petition petition = md.gov.epetitie.model.Petition.builder()
                .id(detail.id())
                .trackingNumber(detail.trackingNumber())
                .title(detail.title())
                .description(detail.description())
                .category(detail.category())
                .targetAuthority(detail.targetAuthority())
                .author(md.gov.epetitie.model.User.builder()
                        .firstName(detail.authorName())
                        .lastName("")
                        .idnp(detail.authorIdnp())
                        .build())
                .createdAt(detail.createdAt() != null ? detail.createdAt() : java.time.LocalDateTime.now())
                .build();

        String officerOpinion = (requestDto != null) ? requestDto.officerOpinion() : null;
        AiResolutionDraftDto draft = geminiAiService.generateDraftResolution(petition, officerOpinion);
        return ResponseEntity.ok(draft);
    }

    @GetMapping(value = "/{id}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> downloadPetitionReceiptPdf(@PathVariable Long id) {
        byte[] pdfBytes = petitionService.generatePetitionReceiptPdf(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "Recipisa_Petitie_" + id + ".pdf");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }

    @GetMapping("/officers")
    public ResponseEntity<List<UserDto>> getAllOfficers() {
        return ResponseEntity.ok(userService.getAllOfficers());
    }
}
