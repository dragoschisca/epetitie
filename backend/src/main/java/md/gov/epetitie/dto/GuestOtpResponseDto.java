package md.gov.epetitie.dto;

public record GuestOtpResponseDto(
    String message,
    String target,
    String otpCode
) {}
