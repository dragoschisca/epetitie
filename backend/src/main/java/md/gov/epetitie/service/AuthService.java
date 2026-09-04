package md.gov.epetitie.service;

import md.gov.epetitie.dto.AuthResponse;
import md.gov.epetitie.dto.LoginRequest;
import md.gov.epetitie.dto.RegisterRequest;
import md.gov.epetitie.dto.UserDto;
import md.gov.epetitie.mapper.UserMapper;
import md.gov.epetitie.model.Role;
import md.gov.epetitie.model.RoleName;
import md.gov.epetitie.model.User;
import md.gov.epetitie.repository.RoleRepository;
import md.gov.epetitie.repository.UserRepository;
import md.gov.epetitie.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserMapper userMapper;

    public AuthService(UserRepository userRepository, RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userMapper = userMapper;
    }

    @Transactional
    public AuthResponse registerCitizen(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Numele de utilizator este deja folosit.");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Adresa de email este deja utilizată.");
        }
        if (request.idnp() != null && userRepository.existsByIdnp(request.idnp())) {
            throw new IllegalArgumentException("IDNP-ul introdus este deja înregistrat în sistem.");
        }

        Role citizenRole = roleRepository.findByName(RoleName.ROLE_CITIZEN)
                .orElseGet(() -> roleRepository.save(Role.builder().name(RoleName.ROLE_CITIZEN).build()));

        User user = User.builder()
                .idnp(request.idnp())
                .username(request.username())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .firstName(request.firstName())
                .lastName(request.lastName())
                .phone(request.phone())
                .department(request.department())
                .enabled(true)
                .roles(Set.of(citizenRole))
                .build();

        User savedUser = userRepository.save(user);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = tokenProvider.generateToken(authentication);
        UserDto userDto = userMapper.toDto(savedUser);

        return new AuthResponse(token, userDto);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.usernameOrEmail(), request.password())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsername(request.usernameOrEmail())
                .orElseGet(() -> userRepository.findByEmail(request.usernameOrEmail()).orElseThrow());

        UserDto userDto = userMapper.toDto(user);
        return new AuthResponse(token, userDto);
    }
}
