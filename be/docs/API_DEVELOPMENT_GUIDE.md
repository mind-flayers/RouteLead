# API Development Guide

This guide provides step-by-step instructions for developing new APIs in the RouteLead backend following industry best practices.

## 🏗️ Architecture Principles

### 1. Layered Architecture
- **Controllers**: Handle HTTP requests/responses
- **Services**: Contain business logic
- **Repositories**: Handle data persistence
- **DTOs**: Transfer data between layers
- **Models**: JPA entities

### 2. Separation of Concerns
- Each layer has a specific responsibility
- Dependencies flow in one direction (Controller → Service → Repository)
- No circular dependencies

### 3. Single Responsibility Principle
- Each class has one reason to change
- Methods are focused and concise
- Clear naming conventions

## 📋 Development Checklist

Before starting a new API, ensure you have:

- [ ] Clear requirements and specifications
- [ ] Database schema design
- [ ] API endpoint design
- [ ] Validation rules defined
- [ ] Error handling strategy
- [ ] Test cases planned

## 🚀 Step-by-Step API Development

### Step 1: Create the Model (Entity)

Create your JPA entity in `src/main/java/com/example/routelead/model/`:

```java
package com.example.routelead.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;

@Entity
@Table(name = "your_entity")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class YourEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name", nullable = false)
    private String name;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private ZonedDateTime updatedAt;
}
```

### Step 2: Create DTOs

Create request and response DTOs in `src/main/java/com/example/routelead/dto/`:

**Response DTO:**
```java
package com.example.routelead.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.ZonedDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class YourEntityDto {
    private Long id;
    private String name;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
}
```

**Request DTO:**
```java
package com.example.routelead.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class YourEntityRequestDto {
    
    @NotBlank(message = "Name is required")
    @Size(min = 1, max = 100, message = "Name must be between 1 and 100 characters")
    private String name;
}
```

### Step 3: Create Repository

Create your repository interface in `src/main/java/com/example/routelead/repository/`:

```java
package com.example.routelead.repository;

import com.example.routelead.model.YourEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface YourEntityRepository extends JpaRepository<YourEntity, Long> {
    
    List<YourEntity> findByName(String name);
    
    Optional<YourEntity> findByNameIgnoreCase(String name);
    
    boolean existsByName(String name);
}
```

### Step 4: Create Service

Create your service class in `src/main/java/com/example/routelead/service/`:

```java
package com.example.routelead.service;

import com.example.routelead.dto.YourEntityDto;
import com.example.routelead.dto.YourEntityRequestDto;
import com.example.routelead.exception.ResourceNotFoundException;
import com.example.routelead.exception.ValidationException;
import com.example.routelead.model.YourEntity;
import com.example.routelead.repository.YourEntityRepository;
import com.example.routelead.util.ValidationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class YourEntityService {

    private final YourEntityRepository yourEntityRepository;

    public List<YourEntityDto> getAllEntities() {
        log.info("Fetching all entities");
        return yourEntityRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public YourEntityDto getEntityById(Long id) {
        ValidationUtils.validateNotNull(id, "id");
        log.info("Fetching entity with ID: {}", id);
        
        YourEntity entity = yourEntityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Entity", id.toString()));
        
        return convertToDto(entity);
    }

    public YourEntityDto createEntity(YourEntityRequestDto requestDto) {
        validateEntityRequest(requestDto);
        log.info("Creating entity with name: {}", requestDto.getName());
        
        if (yourEntityRepository.existsByName(requestDto.getName())) {
            throw new ValidationException("name", "already exists");
        }
        
        YourEntity entity = convertToEntity(requestDto);
        YourEntity savedEntity = yourEntityRepository.save(entity);
        
        log.info("Entity created with ID: {}", savedEntity.getId());
        return convertToDto(savedEntity);
    }

    private void validateEntityRequest(YourEntityRequestDto requestDto) {
        ValidationUtils.validateNotNull(requestDto, "requestDto");
        ValidationUtils.validateNotNullOrEmpty(requestDto.getName(), "name");
    }

    private YourEntityDto convertToDto(YourEntity entity) {
        return YourEntityDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private YourEntity convertToEntity(YourEntityRequestDto requestDto) {
        return YourEntity.builder()
                .name(requestDto.getName())
                .build();
    }
}
```

### Step 5: Create Controller

Create your controller in `src/main/java/com/example/routelead/controller/`:

```java
package com.example.routelead.controller;

import com.example.routelead.dto.YourEntityDto;
import com.example.routelead.dto.YourEntityRequestDto;
import com.example.routelead.service.YourEntityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/your-entities")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class YourEntityController {

    private final YourEntityService yourEntityService;

    @GetMapping
    public ResponseEntity<List<YourEntityDto>> getAllEntities() {
        log.info("GET /api/v1/your-entities - Fetching all entities");
        List<YourEntityDto> entities = yourEntityService.getAllEntities();
        return ResponseEntity.ok(entities);
    }

    @GetMapping("/{id}")
    public ResponseEntity<YourEntityDto> getEntityById(@PathVariable Long id) {
        log.info("GET /api/v1/your-entities/{} - Fetching entity by ID", id);
        YourEntityDto entity = yourEntityService.getEntityById(id);
        return ResponseEntity.ok(entity);
    }

    @PostMapping
    public ResponseEntity<YourEntityDto> createEntity(@Valid @RequestBody YourEntityRequestDto requestDto) {
        log.info("POST /api/v1/your-entities - Creating new entity: {}", requestDto.getName());
        YourEntityDto createdEntity = yourEntityService.createEntity(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdEntity);
    }
}
```

## 🧪 Testing Best Practices

### 1. Unit Tests
- Test individual methods in isolation
- Mock dependencies
- Test both success and failure scenarios

### 2. Integration Tests
- Test component interactions
- Use test database
- Test end-to-end workflows

### 3. Controller Tests
- Test HTTP endpoints
- Verify response status and content
- Test validation errors

## 🔧 Configuration

### 1. Database Migration
Create migration scripts in `src/main/resources/db/migration/`:

```sql
-- V2__create_your_entity_table.sql
CREATE TABLE your_entity (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_your_entity_name ON your_entity(name);
```

## 📝 Code Review Checklist

Before submitting your API for review:

- [ ] All tests pass
- [ ] Code follows naming conventions
- [ ] Proper error handling implemented
- [ ] Input validation added
- [ ] Logging implemented
- [ ] Documentation updated
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed

## 🚀 Deployment Considerations

### 1. Database Changes
- Ensure migrations are tested
- Plan for rollback scenarios
- Consider data migration needs

### 2. API Versioning
- Use semantic versioning
- Plan for backward compatibility
- Document breaking changes

## 🔍 Common Pitfalls

### 1. Security
- Always validate input
- Use parameterized queries
- Implement proper authentication
- Sanitize output

### 2. Performance
- Add database indexes
- Use pagination for large datasets
- Implement caching where appropriate
- Monitor query performance

### 3. Error Handling
- Use custom exceptions
- Provide meaningful error messages
- Log errors appropriately
- Handle edge cases

## 📚 Additional Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Data JPA Reference](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/)
- [Bean Validation Specification](https://beanvalidation.org/)
- [REST API Design Best Practices](https://restfulapi.net/)

## 🤝 Getting Help

If you encounter issues during development:

1. Check the existing codebase for examples
2. Review the main documentation
3. Search for similar implementations
4. Ask the development team
5. Create an issue in the repository 