package md.gov.epetitie.model;

public enum PetitionStatus {
    DRAFT("Ciornă"),
    COLLECTING_SIGNATURES("Colectare Semnături"),
    SUBMITTED("Inregistrată / Depusă"),
    IN_REVIEW("În Examinare"),
    REDIRECTED("Redirecționată"),
    RESOLVED("Soluționată"),
    REJECTED("Respinsă");

    private final String label;

    PetitionStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
