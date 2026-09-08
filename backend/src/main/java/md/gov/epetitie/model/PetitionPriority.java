package md.gov.epetitie.model;

public enum PetitionPriority {
    LOW("Scăzută"),
    NORMAL("Normală"),
    MEDIUM("Medie"),
    HIGH("Ridicată"),
    URGENT("Urgentă");

    private final String label;

    PetitionPriority(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
