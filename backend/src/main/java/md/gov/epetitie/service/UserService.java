package md.gov.epetitie.service;

import md.gov.epetitie.dto.UserDto;
import md.gov.epetitie.mapper.UserMapper;
import md.gov.epetitie.model.RoleName;
import md.gov.epetitie.model.User;
import md.gov.epetitie.repository.UserRepository;
import md.gov.epetitie.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public UserService(UserRepository userRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUserDto(UserPrincipal currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Utilizatorul nu există."));
        return userMapper.toDto(user);
    }

    @Transactional(readOnly = true)
    public User getEntityById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilizatorul cu ID " + id + " nu a fost găsit."));
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAllOfficers() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName() == RoleName.ROLE_OFFICER))
                .map(userMapper::toDto)
                .toList();
    }
}
