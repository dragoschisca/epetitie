package md.gov.epetitie.controller;

import jakarta.validation.Valid;
import md.gov.epetitie.dto.AuthResponse;
import md.gov.epetitie.dto.LoginRequest;
import md.gov.epetitie.dto.RegisterRequest;
import md.gov.epetitie.dto.UserDto;
import md.gov.epetitie.security.UserPrincipal;
import md.gov.epetitie.service.AuthService;
import md.gov.epetitie.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> registerCitizen(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.registerCitizen(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(@AuthenticationPrincipal UserPrincipal currentUser) {
        UserDto userDto = userService.getCurrentUserDto(currentUser);
        return ResponseEntity.ok(userDto);
    }
}
