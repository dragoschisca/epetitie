package md.gov.epetitie.repository;

import md.gov.epetitie.model.PetitionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PetitionHistoryRepository extends JpaRepository<PetitionHistory, Long> {

    List<PetitionHistory> findByPetitionIdOrderByCreatedAtDesc(Long petitionId);
    
    void deleteAllByPetitionId(Long petitionId);
}
