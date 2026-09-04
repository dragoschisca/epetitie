package md.gov.epetitie.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Numele de utilizator sau email-ul este obligatoriu")
        String usernameOrEmail,

        @NotBlank(message = "Parola este obligatorie")
        String password
) {}
