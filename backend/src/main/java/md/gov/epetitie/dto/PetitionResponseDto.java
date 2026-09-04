package md.gov.epetitie.dto;

import md.gov.epetitie.model.PetitionCategory;
import md.gov.epetitie.model.PetitionPriority;
import md.gov.epetitie.model.PetitionStatus;

import java.time.LocalDateTime;

public record PetitionResponseDto(
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
        Long assignedOfficerId,
        String assignedOfficerName,
        String aiTriageSummary,
        Boolean hasSigned,
        Long daysRemaining
) {}
