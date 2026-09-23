package md.gov.epetitie.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import md.gov.epetitie.model.PetitionCategory;

public record PetitionUpdateDto(
        @NotBlank(message = "Titlul este obligatoriu")
        @Size(min = 10, max = 255, message = "Titlul trebuie să conțină între 10 și 255 caractere")
        String title,
        
        @NotBlank(message = "Descrierea este obligatorie")
        @Size(min = 30, message = "Descrierea trebuie să conțină cel puțin 30 de caractere")
        String description,
        
        @NotNull(message = "Categoria este obligatorie")
        PetitionCategory category,

        @Size(max = 255, message = "Autoritatea destinatară poate avea maximum 255 de caractere")
        String targetAuthority
) {}

