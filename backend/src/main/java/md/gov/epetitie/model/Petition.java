package md.gov.epetitie.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "petitions")
public class Petition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tracking_number", nullable = false, unique = true, length = 32)
    private String trackingNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(name = "is_public_initiative", nullable = false)
    private Boolean isPublicInitiative = false;

    @Column(name = "signature_threshold", nullable = false)
    private Integer signatureThreshold = 0;

    @Column(name = "current_signature_count", nullable = false)
    private Integer currentSignatureCount = 1;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private PetitionCategory category;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PetitionStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PetitionPriority priority;

    @Column(name = "submission_date")
    private LocalDateTime submissionDate;

    @Column(name = "deadline_date")
    private LocalDateTime deadlineDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_officer_id")
    private User assignedOfficer;

    @Column(name = "resolution_text", columnDefinition = "TEXT")
    private String resolutionText;

    @Column(name = "ai_triage_summary", columnDefinition = "TEXT")
    private String aiTriageSummary;

    @Version
    @Column(nullable = false)
    private Long version;

    @OneToMany(mappedBy = "petition", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PetitionAttachment> attachments = new ArrayList<>();

    @OneToMany(mappedBy = "petition", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PetitionHistory> history = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Petition() {}

    public Petition(Long id, String trackingNumber, User author, Boolean isPublicInitiative,
                    Integer signatureThreshold, Integer currentSignatureCount, PetitionCategory category,
                    String title, String description, PetitionStatus status, PetitionPriority priority,
                    LocalDateTime submissionDate, LocalDateTime deadlineDate, User assignedOfficer,
                    String resolutionText, String aiTriageSummary, Long version,
                    List<PetitionAttachment> attachments, List<PetitionHistory> history,
                    LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.trackingNumber = trackingNumber;
        this.author = author;
        this.isPublicInitiative = isPublicInitiative != null ? isPublicInitiative : false;
        this.signatureThreshold = signatureThreshold != null ? signatureThreshold : 0;
        this.currentSignatureCount = currentSignatureCount != null ? currentSignatureCount : 1;
        this.category = category;
        this.title = title;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.submissionDate = submissionDate;
        this.deadlineDate = deadlineDate;
        this.assignedOfficer = assignedOfficer;
        this.resolutionText = resolutionText;
        this.aiTriageSummary = aiTriageSummary;
        this.version = version;
        this.attachments = attachments != null ? attachments : new ArrayList<>();
        this.history = history != null ? history : new ArrayList<>();
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static PetitionBuilder builder() {
        return new PetitionBuilder();
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

    public User getAuthor() { return author; }
    public void setAuthor(User author) { this.author = author; }

    public Boolean getIsPublicInitiative() { return isPublicInitiative; }
    public void setIsPublicInitiative(Boolean isPublicInitiative) { this.isPublicInitiative = isPublicInitiative; }

    public Integer getSignatureThreshold() { return signatureThreshold; }
    public void setSignatureThreshold(Integer signatureThreshold) { this.signatureThreshold = signatureThreshold; }

    public Integer getCurrentSignatureCount() { return currentSignatureCount; }
    public void setCurrentSignatureCount(Integer currentSignatureCount) { this.currentSignatureCount = currentSignatureCount; }

    public PetitionCategory getCategory() { return category; }
    public void setCategory(PetitionCategory category) { this.category = category; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public PetitionStatus getStatus() { return status; }
    public void setStatus(PetitionStatus status) { this.status = status; }

    public PetitionPriority getPriority() { return priority; }
    public void setPriority(PetitionPriority priority) { this.priority = priority; }

    public LocalDateTime getSubmissionDate() { return submissionDate; }
    public void setSubmissionDate(LocalDateTime submissionDate) { this.submissionDate = submissionDate; }

    public LocalDateTime getDeadlineDate() { return deadlineDate; }
    public void setDeadlineDate(LocalDateTime deadlineDate) { this.deadlineDate = deadlineDate; }

    public User getAssignedOfficer() { return assignedOfficer; }
    public void setAssignedOfficer(User assignedOfficer) { this.assignedOfficer = assignedOfficer; }

    public String getResolutionText() { return resolutionText; }
    public void setResolutionText(String resolutionText) { this.resolutionText = resolutionText; }

    public String getAiTriageSummary() { return aiTriageSummary; }
    public void setAiTriageSummary(String aiTriageSummary) { this.aiTriageSummary = aiTriageSummary; }

    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }

    public List<PetitionAttachment> getAttachments() { return attachments; }
    public void setAttachments(List<PetitionAttachment> attachments) { this.attachments = attachments; }

    public List<PetitionHistory> getHistory() { return history; }
    public void setHistory(List<PetitionHistory> history) { this.history = history; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static class PetitionBuilder {
        private Long id;
        private String trackingNumber;
        private User author;
        private Boolean isPublicInitiative = false;
        private Integer signatureThreshold = 0;
        private Integer currentSignatureCount = 1;
        private PetitionCategory category;
        private String title;
        private String description;
        private PetitionStatus status;
        private PetitionPriority priority;
        private LocalDateTime submissionDate;
        private LocalDateTime deadlineDate;
        private User assignedOfficer;
        private String resolutionText;
        private String aiTriageSummary;
        private Long version;
        private List<PetitionAttachment> attachments = new ArrayList<>();
        private List<PetitionHistory> history = new ArrayList<>();
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public PetitionBuilder id(Long id) { this.id = id; return this; }
        public PetitionBuilder trackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; return this; }
        public PetitionBuilder author(User author) { this.author = author; return this; }
        public PetitionBuilder isPublicInitiative(Boolean isPublicInitiative) { this.isPublicInitiative = isPublicInitiative; return this; }
        public PetitionBuilder signatureThreshold(Integer signatureThreshold) { this.signatureThreshold = signatureThreshold; return this; }
        public PetitionBuilder currentSignatureCount(Integer currentSignatureCount) { this.currentSignatureCount = currentSignatureCount; return this; }
        public PetitionBuilder category(PetitionCategory category) { this.category = category; return this; }
        public PetitionBuilder title(String title) { this.title = title; return this; }
        public PetitionBuilder description(String description) { this.description = description; return this; }
        public PetitionBuilder status(PetitionStatus status) { this.status = status; return this; }
        public PetitionBuilder priority(PetitionPriority priority) { this.priority = priority; return this; }
        public PetitionBuilder submissionDate(LocalDateTime submissionDate) { this.submissionDate = submissionDate; return this; }
        public PetitionBuilder deadlineDate(LocalDateTime deadlineDate) { this.deadlineDate = deadlineDate; return this; }
        public PetitionBuilder assignedOfficer(User assignedOfficer) { this.assignedOfficer = assignedOfficer; return this; }
        public PetitionBuilder resolutionText(String resolutionText) { this.resolutionText = resolutionText; return this; }
        public PetitionBuilder aiTriageSummary(String aiTriageSummary) { this.aiTriageSummary = aiTriageSummary; return this; }
        public PetitionBuilder version(Long version) { this.version = version; return this; }
        public PetitionBuilder attachments(List<PetitionAttachment> attachments) { this.attachments = attachments; return this; }
        public PetitionBuilder history(List<PetitionHistory> history) { this.history = history; return this; }
        public PetitionBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public PetitionBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Petition build() {
            return new Petition(id, trackingNumber, author, isPublicInitiative, signatureThreshold, currentSignatureCount,
                    category, title, description, status, priority, submissionDate, deadlineDate, assignedOfficer,
                    resolutionText, aiTriageSummary, version, attachments, history, createdAt, updatedAt);
        }
    }
}
