package md.gov.epetitie.controller;

import md.gov.epetitie.dto.PetitionResponseDto;
import md.gov.epetitie.model.PetitionCategory;
import md.gov.epetitie.security.UserPrincipal;
import md.gov.epetitie.service.PetitionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/public")
public class PublicInitiativeController {

    private final PetitionService petitionService;

    public PublicInitiativeController(PetitionService petitionService) {
        this.petitionService = petitionService;
    }

    @GetMapping("/initiatives")
    public ResponseEntity<Page<PetitionResponseDto>> getPublicInitiatives(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) PetitionCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<PetitionResponseDto> initiatives = petitionService.getPublicInitiatives(search, category, pageRequest, currentUser);
        return ResponseEntity.ok(initiatives);
    }

    @GetMapping("/petitions/{id}")
    public ResponseEntity<md.gov.epetitie.dto.PetitionDetailDto> getPublicPetitionDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        md.gov.epetitie.dto.PetitionDetailDto detail = petitionService.getPetitionDetails(id, currentUser);
        return ResponseEntity.ok(detail);
    }

    @PostMapping("/petitions/{id}/send-otp")
    public ResponseEntity<md.gov.epetitie.dto.GuestOtpResponseDto> sendGuestOtp(
            @PathVariable Long id,
            @jakarta.validation.Valid @RequestBody md.gov.epetitie.dto.GuestOtpRequestDto dto
    ) {
        md.gov.epetitie.dto.GuestOtpResponseDto response = petitionService.sendGuestOtp(id, dto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/petitions/{id}/sign-guest")
    public ResponseEntity<md.gov.epetitie.dto.SignInitiativeDto> signGuestInitiative(
            @PathVariable Long id,
            @jakarta.validation.Valid @RequestBody md.gov.epetitie.dto.GuestSignRequestDto dto
    ) {
        md.gov.epetitie.dto.SignInitiativeDto result = petitionService.signGuestInitiative(id, dto);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/petitions/{id}/unsign-guest")
    public ResponseEntity<md.gov.epetitie.dto.SignInitiativeDto> unsignGuestInitiative(
            @PathVariable Long id,
            @jakarta.validation.Valid @RequestBody md.gov.epetitie.dto.GuestUnsignRequestDto dto
    ) {
        md.gov.epetitie.dto.SignInitiativeDto result = petitionService.unsignGuestInitiative(id, dto);
        return ResponseEntity.ok(result);
    }
}
