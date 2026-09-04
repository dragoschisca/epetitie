package md.gov.epetitie.dto;

import jakarta.validation.constraints.NotNull;
import md.gov.epetitie.model.PetitionStatus;

public record PetitionStatusUpdateDto(
        @NotNull(message = "Noul status este obligatoriu")
        PetitionStatus newStatus,

        String resolutionText,

        String note,

        Long assignedOfficerId
) {}
