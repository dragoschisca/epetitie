package md.gov.epetitie.repository;

import md.gov.epetitie.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findByIdnp(String idnp);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByIdnp(String idnp);
}
