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
        LocalDateTime createdAt
) {}
