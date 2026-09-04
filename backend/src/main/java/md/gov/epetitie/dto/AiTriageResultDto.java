package md.gov.epetitie.dto;

import md.gov.epetitie.model.PetitionCategory;
import md.gov.epetitie.model.PetitionPriority;

public record AiTriageResultDto(
        PetitionCategory recommendedCategory,
        PetitionPriority suggestedPriority,
        String executiveBriefingSummary
) {}
