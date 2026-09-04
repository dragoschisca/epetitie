package md.gov.epetitie.dto;

import java.util.Set;

public record UserDto(
        Long id,
        String idnp,
        String username,
        String email,
        String firstName,
        String lastName,
        String fullName,
        String phone,
        String department,
        Set<String> roles
) {}
