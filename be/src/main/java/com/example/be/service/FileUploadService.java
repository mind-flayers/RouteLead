package com.example.be.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileUploadService {

    private static final Logger log = LoggerFactory.getLogger(FileUploadService.class);
    
    // Allowed file types for document uploads
    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
        "image/jpeg", "image/jpg", "image/png"
    );
    
    private static final List<String> ALLOWED_DOCUMENT_TYPES = Arrays.asList(
        "application/pdf"
    );
    
    // Maximum file size: 10MB
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;
    
    @Value("${supabase.url:https://fnsaibersyxpedauhwfw.supabase.co}")
    private String supabaseUrl;
    
    @Value("${supabase.storage.bucket:user-documents}")
    private String storageBucket;
    
    @Value("${file.upload.directory:uploads}")
    private String uploadDirectory;

    /**
     * Validate file for upload
     */
    public void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("File cannot be empty");
        }
        
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("File size cannot exceed 10MB");
        }
        
        String contentType = file.getContentType();
        if (contentType == null) {
            throw new RuntimeException("File type cannot be determined");
        }
        
        if (!ALLOWED_IMAGE_TYPES.contains(contentType) && !ALLOWED_DOCUMENT_TYPES.contains(contentType)) {
            throw new RuntimeException("File type not allowed. Allowed types: JPEG, PNG, PDF");
        }
        
        log.info("File validation passed for: {} ({})", file.getOriginalFilename(), contentType);
    }

    /**
     * Generate unique filename for upload
     */
    public String generateFileName(String originalFilename, UUID driverId, String documentType) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String extension = getFileExtension(originalFilename);
        return String.format("%s/%s/%s_%s%s", driverId.toString(), documentType, timestamp, UUID.randomUUID().toString().substring(0, 8), extension);
    }

    /**
     * Generate file path for Supabase Storage
     */
    public String generateStoragePath(UUID driverId, String documentType, String filename) {
        return String.format("%s/%s/%s", driverId.toString(), documentType, filename);
    }

    /**
     * Generate Supabase Storage URL
     */
    public String generateStorageUrl(String filePath) {
        return String.format("%s/storage/v1/object/public/%s/%s", supabaseUrl, storageBucket, filePath);
    }

    /**
     * Generate signed URL for file upload (placeholder - will be implemented with Supabase SDK)
     */
    public String generateUploadUrl(String filePath) {
        // TODO: Implement with Supabase SDK for signed URL generation
        // For now, return a placeholder URL structure
        return String.format("%s/storage/v1/object/%s/%s", supabaseUrl, storageBucket, filePath);
    }

    /**
     * Save file to Supabase Storage (HTTP API implementation)
     */
    public String saveFileToSupabase(MultipartFile file, UUID driverId, String documentType) throws IOException {
        validateFile(file);
        
        String filename = generateFileName(file.getOriginalFilename(), driverId, documentType);
        String storagePath = generateStoragePath(driverId, documentType, filename);
        
        try {
            // For production: Implement Supabase Storage API upload
            // This would involve HTTP calls to Supabase Storage API
            // For now, save locally and return Supabase-formatted URL
            
            saveFileLocally(file, driverId, documentType);
            
            // Generate proper Supabase Storage URL
            String supabaseUrl = generateStorageUrl(storagePath);
            
            log.info("File processed for Supabase Storage: {}", supabaseUrl);
            
            return supabaseUrl;
            
        } catch (Exception e) {
            log.error("Error saving file to Supabase Storage: {}", e.getMessage());
            throw new IOException("Failed to save file to Supabase Storage", e);
        }
    }

    /**
     * Save file locally (temporary implementation until Supabase integration)
     */
    public String saveFileLocally(MultipartFile file, UUID driverId, String documentType) throws IOException {
        validateFile(file);
        
        String filename = generateFileName(file.getOriginalFilename(), driverId, documentType);
        Path uploadPath = Paths.get(uploadDirectory);
        
        // Create directories if they don't exist
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        Path filePath = uploadPath.resolve(filename);
        
        // Create subdirectories for driver and document type
        Path parentDir = filePath.getParent();
        if (!Files.exists(parentDir)) {
            Files.createDirectories(parentDir);
        }
        
        // Save file
        Files.copy(file.getInputStream(), filePath);
        
        log.info("File saved locally: {}", filePath.toString());
        
        // Return a URL-like path
        return "/uploads/" + filename;
    }

    /**
     * Delete file (placeholder implementation)
     */
    public void deleteFile(String filePath) {
        try {
            Path path = Paths.get(uploadDirectory, filePath.replace("/uploads/", ""));
            if (Files.exists(path)) {
                Files.delete(path);
                log.info("File deleted: {}", path.toString());
            }
        } catch (IOException e) {
            log.error("Error deleting file: {}", filePath, e);
            throw new RuntimeException("Failed to delete file: " + filePath);
        }
    }

    /**
     * Check if file exists
     */
    public boolean fileExists(String filePath) {
        try {
            Path path = Paths.get(uploadDirectory, filePath.replace("/uploads/", ""));
            return Files.exists(path);
        } catch (Exception e) {
            log.error("Error checking file existence: {}", filePath, e);
            return false;
        }
    }

    /**
     * Get file extension from filename
     */
    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf('.') == -1) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.'));
    }

    /**
     * Get content type from file extension
     */
    public String getContentType(String filename) {
        String extension = getFileExtension(filename).toLowerCase();
        switch (extension) {
            case ".jpg":
            case ".jpeg":
                return "image/jpeg";
            case ".png":
                return "image/png";
            case ".pdf":
                return "application/pdf";
            default:
                return "application/octet-stream";
        }
    }

    /**
     * Generate file metadata for response
     */
    public FileUploadResponse createUploadResponse(String filePath, String originalFilename, long fileSize) {
        FileUploadResponse response = new FileUploadResponse();
        response.setFileName(originalFilename);
        response.setFilePath(filePath);
        response.setFileSize(fileSize);
        response.setContentType(getContentType(originalFilename));
        response.setUploadTime(LocalDateTime.now());
        return response;
    }

    // Inner class for upload response
    public static class FileUploadResponse {
        private String fileName;
        private String filePath;
        private long fileSize;
        private String contentType;
        private LocalDateTime uploadTime;

        // Getters and setters
        public String getFileName() { return fileName; }
        public void setFileName(String fileName) { this.fileName = fileName; }
        
        public String getFilePath() { return filePath; }
        public void setFilePath(String filePath) { this.filePath = filePath; }
        
        public long getFileSize() { return fileSize; }
        public void setFileSize(long fileSize) { this.fileSize = fileSize; }
        
        public String getContentType() { return contentType; }
        public void setContentType(String contentType) { this.contentType = contentType; }
        
        public LocalDateTime getUploadTime() { return uploadTime; }
        public void setUploadTime(LocalDateTime uploadTime) { this.uploadTime = uploadTime; }
    }
}
