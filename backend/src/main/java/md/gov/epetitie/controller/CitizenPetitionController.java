package md.gov.epetitie.controller;

import jakarta.validation.Valid;
import md.gov.epetitie.dto.PetitionCreateDto;
import md.gov.epetitie.dto.PetitionDetailDto;
import md.gov.epetitie.dto.PetitionResponseDto;
import md.gov.epetitie.dto.SignInitiativeDto;
import md.gov.epetitie.security.UserPrincipal;
import md.gov.epetitie.service.PetitionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/citizen/petitions")
public class CitizenPetitionController {

    private final PetitionService petitionService;

    public CitizenPetitionController(PetitionService petitionService) {
        this.petitionService = petitionService;
    }

    @PostMapping
    public ResponseEntity<PetitionResponseDto> createPetition(
            @Valid @RequestBody PetitionCreateDto dto,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        PetitionResponseDto response = petitionService.createPetition(dto, currentUser);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PetitionResponseDto> updatePetition(
            @PathVariable Long id,
            @Valid @RequestBody md.gov.epetitie.dto.PetitionUpdateDto dto,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        PetitionResponseDto response = petitionService.updatePetition(id, dto, currentUser);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePetition(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        petitionService.deletePetition(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/sign")
    public ResponseEntity<SignInitiativeDto> signInitiative(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        SignInitiativeDto result = petitionService.signInitiative(id, currentUser);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{id}/unsign")
    public ResponseEntity<SignInitiativeDto> unsignInitiative(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        SignInitiativeDto result = petitionService.unsignInitiative(id, currentUser);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/my-authored")
    public ResponseEntity<Page<PetitionResponseDto>> getMyAuthoredPetitions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<PetitionResponseDto> result = petitionService.getCitizenAuthoredPetitions(currentUser, pageRequest);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/my-supported")
    public ResponseEntity<Page<PetitionResponseDto>> getMySupportedInitiatives(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<PetitionResponseDto> result = petitionService.getCitizenSupportedInitiatives(currentUser, pageRequest);
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
}
