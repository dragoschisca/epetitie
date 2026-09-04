package md.gov.epetitie.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import md.gov.epetitie.model.PetitionCategory;

public record PetitionUpdateDto(
        @NotBlank(message = "Titlul este obligatoriu")
        String title,
        
        @NotBlank(message = "Descrierea este obligatorie")
        String description,
        
        @NotNull(message = "Categoria este obligatorie")
        PetitionCategory category
) {}
