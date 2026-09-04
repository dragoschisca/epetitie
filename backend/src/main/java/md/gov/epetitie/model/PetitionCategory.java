package md.gov.epetitie.model;

public enum PetitionCategory {
    INFRASTRUCTURA("Infrastructură și Dezvoltare Regională"),
    MEDIU("Protecția Mediului și Resurse Naturale"),
    SANATATE("Sănătate Publică și Asistență Socială"),
    ADMINISTRATIE_PUBLICA("Administrație Publică și Servicii"),
    SOCIAL("Protecție Socială și Muncă"),
    EDUCATIE("Educație, Cultură și Cercetare");

    private final String displayName;

    PetitionCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
