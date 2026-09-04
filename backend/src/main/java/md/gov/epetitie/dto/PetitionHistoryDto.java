package md.gov.epetitie.dto;

import md.gov.epetitie.model.PetitionStatus;

import java.time.LocalDateTime;

public record PetitionHistoryDto(
        Long id,
        PetitionStatus fromStatus,
        PetitionStatus toStatus,
        String note,
        String actorName,
        LocalDateTime createdAt
) {}
