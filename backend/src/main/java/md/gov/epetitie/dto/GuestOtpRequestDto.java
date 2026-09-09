package md.gov.epetitie.dto;

import jakarta.validation.constraints.NotBlank;

public record GuestOtpRequestDto(
    @NotBlank(message = "Contactul (email sau telefon) este obligatoriu.")
    String target,
    
    String channel
) {}
