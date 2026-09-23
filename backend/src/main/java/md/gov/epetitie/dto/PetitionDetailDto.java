package md.gov.epetitie.dto;

import md.gov.epetitie.model.PetitionCategory;
import md.gov.epetitie.model.PetitionPriority;
import md.gov.epetitie.model.PetitionStatus;

import java.time.LocalDateTime;
import java.util.List;

public record PetitionDetailDto(
        Long id,
        String trackingNumber,
        String title,
        String description,
        PetitionCategory category,
        PetitionStatus status,
        PetitionPriority priority,
        Boolean isPublicInitiative,
        Integer signatureThreshold,
        Integer currentSignatureCount,
        LocalDateTime submissionDate,
        LocalDateTime deadlineDate,
        Long authorId,
        String authorName,
        String authorIdnp,
        Long assignedOfficerId,
        String assignedOfficerName,
        String resolutionText,
        String aiTriageSummary,
        Boolean hasSigned,
        Long daysRemaining,
        List<PetitionHistoryDto> history,
        LocalDateTime createdAt,
        String targetAuthority
) {
    public PetitionDetailDto withHasSigned(Boolean newHasSigned) {
        return new PetitionDetailDto(
                id, trackingNumber, title, description, category, status, priority,
                isPublicInitiative, signatureThreshold, currentSignatureCount,
                submissionDate, deadlineDate, authorId, authorName, authorIdnp,
                assignedOfficerId, assignedOfficerName, resolutionText,
                aiTriageSummary, newHasSigned, daysRemaining, history,
                createdAt, targetAuthority
        );
    }
}
