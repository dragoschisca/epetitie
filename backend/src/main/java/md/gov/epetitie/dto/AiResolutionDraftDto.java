package md.gov.epetitie.dto;

public record AiResolutionDraftDto(
        Long petitionId,
        String trackingNumber,
        String draftResolutionText,
        String legalBasisReference
) {}
