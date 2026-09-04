package md.gov.epetitie.dto;

public record SignInitiativeDto(
        Long petitionId,
        String signatureHash,
        Integer newSignatureCount,
        PetitionResponseDto petition
) {}
