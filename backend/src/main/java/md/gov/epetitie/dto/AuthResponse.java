package md.gov.epetitie.dto;

public record AuthResponse(
        String accessToken,
        String tokenType,
        UserDto user
) {
    public AuthResponse(String accessToken, UserDto user) {
        this(accessToken, "Bearer", user);
    }
}
