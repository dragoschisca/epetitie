package md.gov.epetitie.repository;

import md.gov.epetitie.model.Petition;
import md.gov.epetitie.model.PetitionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PetitionRepository extends JpaRepository<Petition, Long>, JpaSpecificationExecutor<Petition> {

    Optional<Petition> findByTrackingNumber(String trackingNumber);

    Page<Petition> findByAuthorId(Long authorId, Pageable pageable);

    Page<Petition> findByIsPublicInitiativeTrueAndStatus(PetitionStatus status, Pageable pageable);

    List<Petition> findByAssignedOfficerId(Long officerId);
}
