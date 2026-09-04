package md.gov.epetitie.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import md.gov.epetitie.annotation.ValidIdnp;

public record RegisterRequest(
        @NotBlank(message = "IDNP-ul este obligatoriu")
        @ValidIdnp
        String idnp,

        @NotBlank(message = "Numele de utilizator este obligatoriu")
        @Size(min = 4, max = 50, message = "Numele de utilizator trebuie să aibă între 4 și 50 caractere")
        String username,

        @NotBlank(message = "Adresa de email este obligatorie")
        @Email(message = "Formatul adresei de email este invalid")
        String email,

        @NotBlank(message = "Parola este obligatorie")
        @Size(min = 8, message = "Parola trebuie să conțină cel puțin 8 caractere")
        String password,

        @NotBlank(message = "Prenumele este obligatoriu")
        String firstName,

        @NotBlank(message = "Numele de familie este obligatoriu")
        String lastName,

        String phone,
        String department
) {}
