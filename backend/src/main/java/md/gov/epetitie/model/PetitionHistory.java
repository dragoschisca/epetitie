package md.gov.epetitie.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "petition_history")
public class PetitionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "petition_id", nullable = false)
    private Petition petition;

    @Enumerated(EnumType.STRING)
    @Column(name = "from_status", length = 30)
    private PetitionStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "to_status", nullable = false, length = 30)
    private PetitionStatus toStatus;

    @Column(columnDefinition = "TEXT")
    private String note;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "actor_id", nullable = false)
    private User actor;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public PetitionHistory() {}

    public PetitionHistory(Long id, Petition petition, PetitionStatus fromStatus, PetitionStatus toStatus,
                           String note, User actor, LocalDateTime createdAt) {
        this.id = id;
        this.petition = petition;
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
        this.note = note;
        this.actor = actor;
        this.createdAt = createdAt;
    }

    public static PetitionHistoryBuilder builder() {
        return new PetitionHistoryBuilder();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Petition getPetition() { return petition; }
    public void setPetition(Petition petition) { this.petition = petition; }

    public PetitionStatus getFromStatus() { return fromStatus; }
    public void setFromStatus(PetitionStatus fromStatus) { this.fromStatus = fromStatus; }

    public PetitionStatus getToStatus() { return toStatus; }
    public void setToStatus(PetitionStatus toStatus) { this.toStatus = toStatus; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public User getActor() { return actor; }
    public void setActor(User actor) { this.actor = actor; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static class PetitionHistoryBuilder {
        private Long id;
        private Petition petition;
        private PetitionStatus fromStatus;
        private PetitionStatus toStatus;
        private String note;
        private User actor;
        private LocalDateTime createdAt;

        public PetitionHistoryBuilder id(Long id) { this.id = id; return this; }
        public PetitionHistoryBuilder petition(Petition petition) { this.petition = petition; return this; }
        public PetitionHistoryBuilder fromStatus(PetitionStatus fromStatus) { this.fromStatus = fromStatus; return this; }
        public PetitionHistoryBuilder toStatus(PetitionStatus toStatus) { this.toStatus = toStatus; return this; }
        public PetitionHistoryBuilder note(String note) { this.note = note; return this; }
        public PetitionHistoryBuilder actor(User actor) { this.actor = actor; return this; }
        public PetitionHistoryBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public PetitionHistory build() {
            return new PetitionHistory(id, petition, fromStatus, toStatus, note, actor, createdAt);
        }
    }
}
