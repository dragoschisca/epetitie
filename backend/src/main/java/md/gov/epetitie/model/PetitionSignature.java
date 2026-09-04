package md.gov.epetitie.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "petition_signatures",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_petition_signatures_petition_citizen",
                columnNames = {"petition_id", "citizen_id"}
        )
)
public class PetitionSignature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "petition_id", nullable = false)
    private Petition petition;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "citizen_id", nullable = false)
    private User citizen;

    @Column(name = "signed_at", nullable = false)
    private LocalDateTime signedAt;

    @Column(name = "signature_hash", nullable = false, length = 64)
    private String signatureHash;

    public PetitionSignature() {}

    public PetitionSignature(Long id, Petition petition, User citizen, LocalDateTime signedAt, String signatureHash) {
        this.id = id;
        this.petition = petition;
        this.citizen = citizen;
        this.signedAt = signedAt;
        this.signatureHash = signatureHash;
    }

    public static PetitionSignatureBuilder builder() {
        return new PetitionSignatureBuilder();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Petition getPetition() { return petition; }
    public void setPetition(Petition petition) { this.petition = petition; }

    public User getCitizen() { return citizen; }
    public void setCitizen(User citizen) { this.citizen = citizen; }

    public LocalDateTime getSignedAt() { return signedAt; }
    public void setSignedAt(LocalDateTime signedAt) { this.signedAt = signedAt; }

    public String getSignatureHash() { return signatureHash; }
    public void setSignatureHash(String signatureHash) { this.signatureHash = signatureHash; }

    public static class PetitionSignatureBuilder {
        private Long id;
        private Petition petition;
        private User citizen;
        private LocalDateTime signedAt;
        private String signatureHash;

        public PetitionSignatureBuilder id(Long id) { this.id = id; return this; }
        public PetitionSignatureBuilder petition(Petition petition) { this.petition = petition; return this; }
        public PetitionSignatureBuilder citizen(User citizen) { this.citizen = citizen; return this; }
        public PetitionSignatureBuilder signedAt(LocalDateTime signedAt) { this.signedAt = signedAt; return this; }
        public PetitionSignatureBuilder signatureHash(String signatureHash) { this.signatureHash = signatureHash; return this; }

        public PetitionSignature build() {
            return new PetitionSignature(id, petition, citizen, signedAt, signatureHash);
        }
    }
}
