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
}
