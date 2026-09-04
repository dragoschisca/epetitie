package md.gov.epetitie.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "petition_attachments")
public class PetitionAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "petition_id", nullable = false)
    private Petition petition;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_type", nullable = false, length = 100)
    private String fileType;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(name = "storage_path", nullable = false, length = 512)
    private String storagePath;

    @Column(name = "checksum_sha256", nullable = false, length = 64)
    private String checksumSha256;

    @CreationTimestamp
    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    public PetitionAttachment() {}

    public PetitionAttachment(Long id, Petition petition, String fileName, String fileType,
                              Long fileSize, String storagePath, String checksumSha256, LocalDateTime uploadedAt) {
        this.id = id;
        this.petition = petition;
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.storagePath = storagePath;
        this.checksumSha256 = checksumSha256;
        this.uploadedAt = uploadedAt;
    }

    public static PetitionAttachmentBuilder builder() {
        return new PetitionAttachmentBuilder();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Petition getPetition() { return petition; }
    public void setPetition(Petition petition) { this.petition = petition; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public String getStoragePath() { return storagePath; }
    public void setStoragePath(String storagePath) { this.storagePath = storagePath; }

    public String getChecksumSha256() { return checksumSha256; }
    public void setChecksumSha256(String checksumSha256) { this.checksumSha256 = checksumSha256; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }

    public static class PetitionAttachmentBuilder {
        private Long id;
        private Petition petition;
        private String fileName;
        private String fileType;
        private Long fileSize;
        private String storagePath;
        private String checksumSha256;
        private LocalDateTime uploadedAt;

        public PetitionAttachmentBuilder id(Long id) { this.id = id; return this; }
        public PetitionAttachmentBuilder petition(Petition petition) { this.petition = petition; return this; }
        public PetitionAttachmentBuilder fileName(String fileName) { this.fileName = fileName; return this; }
        public PetitionAttachmentBuilder fileType(String fileType) { this.fileType = fileType; return this; }
        public PetitionAttachmentBuilder fileSize(Long fileSize) { this.fileSize = fileSize; return this; }
        public PetitionAttachmentBuilder storagePath(String storagePath) { this.storagePath = storagePath; return this; }
        public PetitionAttachmentBuilder checksumSha256(String checksumSha256) { this.checksumSha256 = checksumSha256; return this; }
        public PetitionAttachmentBuilder uploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; return this; }

        public PetitionAttachment build() {
            return new PetitionAttachment(id, petition, fileName, fileType, fileSize, storagePath, checksumSha256, uploadedAt);
        }
    }
}
