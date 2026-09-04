package md.gov.epetitie.mapper;

import md.gov.epetitie.dto.PetitionDetailDto;
import md.gov.epetitie.dto.PetitionHistoryDto;
import md.gov.epetitie.dto.PetitionResponseDto;
import md.gov.epetitie.model.Petition;
import md.gov.epetitie.model.PetitionHistory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PetitionMapper {

    @Mapping(target = "authorId", source = "author.id")
    @Mapping(target = "authorName", expression = "java(petition.getAuthor() != null ? petition.getAuthor().getFullName() : null)")
    @Mapping(target = "assignedOfficerId", source = "assignedOfficer.id")
    @Mapping(target = "assignedOfficerName", expression = "java(petition.getAssignedOfficer() != null ? petition.getAssignedOfficer().getFullName() : null)")
    @Mapping(target = "hasSigned", ignore = true)
    @Mapping(target = "daysRemaining", expression = "java(calculateDaysRemaining(petition.getDeadlineDate()))")
    PetitionResponseDto toResponseDto(Petition petition);

    @Mapping(target = "authorId", source = "author.id")
    @Mapping(target = "authorName", expression = "java(petition.getAuthor() != null ? petition.getAuthor().getFullName() : null)")
    @Mapping(target = "authorIdnp", expression = "java(petition.getAuthor() != null ? petition.getAuthor().getIdnp() : null)")
    @Mapping(target = "assignedOfficerId", source = "assignedOfficer.id")
    @Mapping(target = "assignedOfficerName", expression = "java(petition.getAssignedOfficer() != null ? petition.getAssignedOfficer().getFullName() : null)")
    @Mapping(target = "hasSigned", ignore = true)
    @Mapping(target = "daysRemaining", expression = "java(calculateDaysRemaining(petition.getDeadlineDate()))")
    @Mapping(target = "history", source = "history")
    PetitionDetailDto toDetailDto(Petition petition);

    @Mapping(target = "actorName", expression = "java(history.getActor() != null ? history.getActor().getFullName() : null)")
    PetitionHistoryDto toHistoryDto(PetitionHistory history);

    List<PetitionHistoryDto> toHistoryDtoList(List<PetitionHistory> historyList);

    default Long calculateDaysRemaining(LocalDateTime deadlineDate) {
        if (deadlineDate == null) return null;
        LocalDateTime now = LocalDateTime.now();
        return ChronoUnit.DAYS.between(now, deadlineDate);
    }
}
