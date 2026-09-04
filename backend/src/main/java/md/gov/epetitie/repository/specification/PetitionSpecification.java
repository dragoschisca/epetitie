package md.gov.epetitie.repository.specification;

import jakarta.persistence.criteria.Predicate;
import md.gov.epetitie.model.Petition;
import md.gov.epetitie.model.PetitionCategory;
import md.gov.epetitie.model.PetitionPriority;
import md.gov.epetitie.model.PetitionStatus;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class PetitionSpecification {

    public static Specification<Petition> filter(
            PetitionCategory category,
            PetitionStatus status,
            PetitionPriority priority,
            Boolean isPublicInitiative,
            String searchTerm,
            Long authorId,
            Long assignedOfficerId
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (category != null) {
                predicates.add(cb.equal(root.get("category"), category));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (priority != null) {
                predicates.add(cb.equal(root.get("priority"), priority));
            }

            if (isPublicInitiative != null) {
                predicates.add(cb.equal(root.get("isPublicInitiative"), isPublicInitiative));
            }

            if (authorId != null) {
                predicates.add(cb.equal(root.get("author").get("id"), authorId));
            }

            if (assignedOfficerId != null) {
                predicates.add(cb.equal(root.get("assignedOfficer").get("id"), assignedOfficerId));
            }

            if (StringUtils.hasText(searchTerm)) {
                String pattern = "%" + searchTerm.trim().toLowerCase() + "%";
                Predicate titleLike = cb.like(cb.lower(root.get("title")), pattern);
                Predicate descLike = cb.like(cb.lower(root.get("description")), pattern);
                Predicate trackingLike = cb.like(cb.lower(root.get("trackingNumber")), pattern);
                predicates.add(cb.or(titleLike, descLike, trackingLike));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
