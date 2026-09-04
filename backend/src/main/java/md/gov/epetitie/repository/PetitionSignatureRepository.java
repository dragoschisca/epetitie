package md.gov.epetitie.repository;

import md.gov.epetitie.model.PetitionSignature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PetitionSignatureRepository extends JpaRepository<PetitionSignature, Long> {

    boolean existsByPetitionIdAndCitizenId(Long petitionId, Long citizenId);

    long countByPetitionId(Long petitionId);

    List<PetitionSignature> findByCitizenId(Long citizenId);
    
    void deleteAllByPetitionId(Long petitionId);
}
