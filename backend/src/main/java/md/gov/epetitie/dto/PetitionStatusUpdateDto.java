package md.gov.epetitie.dto;

import md.gov.epetitie.model.PetitionStatus;

public record PetitionStatusUpdateDto(
        PetitionStatus newStatus,

        String resolutionText,

        String note,

        Long assignedOfficerId
) {}

