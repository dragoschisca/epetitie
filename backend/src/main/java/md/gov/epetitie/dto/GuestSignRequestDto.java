package md.gov.epetitie.dto;

import jakarta.validation.constraints.NotBlank;

public record GuestSignRequestDto(
    @NotBlank(message = "Numele complet este obligatoriu.")
    String fullName,

    @NotBlank(message = "Adresa de email sau numărul de telefon este obligatoriu.")
    String contact,

    @NotBlank(message = "Codul de verificare de 5 cifre este obligatoriu.")
    String otpCode
) {}
