# RouteLead Backend API

A comprehensive backend API for the RouteLead logistics platform, built with Spring Boot and following industry best practices.

## � **Latest Update: Delivery Management APIs Fully Tested!**

**✅ Delivery Management APIs - 92.3% Success Rate**  
**📅 Tested:** August 25, 2025  
**📋 Documentation:** [DELIVERY_MANAGEMENT_API_TESTED.md](./DELIVERY_MANAGEMENT_API_TESTED.md)

---

## �🏗️ Architecture Overview

The RouteLead backend follows a **layered architecture** with clear separation of concerns:

```
┌─────────────────┐
│   Controllers   │  ← REST API endpoints
├─────────────────┤
│    Services     │  ← Business logic
├─────────────────┤
│  Repositories   │  ← Data access
├─────────────────┤
│     Models      │  ← Entity classes
└─────────────────┘
```

## 📁 Project Structure

```
src/main/java/com/example/be/
├── controller/          # REST API controllers
├── service/            # Business logic services
├── repository/         # Data access repositories
├── model/              # Entity classes
├── dto/                # Data Transfer Objects
├── enums/              # Enumeration types
├── exception/          # Custom exceptions
├── config/             # Configuration classes
└── util/               # Utility classes
```

## 🚀 Getting Started

### Prerequisites

- Java 17 or higher
- Gradle 8.x
- PostgreSQL database

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd RouteLead/be
   ```

2. **Configure database**
   - Update `application.properties` with your database credentials
   - Ensure PostgreSQL is running

3. **Build the project**
   ```bash
   ./gradlew build
   ```

4. **Run the application**
   ```bash
   ./gradlew bootRun
   ```

The API will be available at `http://localhost:8080`

## 📚 API Documentation

### Base URL
```
http://localhost:8080/api/v1
```

### Available APIs

- **Vehicle Management**: `/vehicles` - [Documentation](VEHICLE_API.md)
- **User Management**: `/users` - Coming soon
- **Route Management**: `/routes` - Coming soon
- **Bid Management**: `/bids` - Coming soon

## 🛠️ Development Guidelines

### Code Organization

1. **Controllers**: Handle HTTP requests/responses
2. **Services**: Contain business logic
3. **Repositories**: Handle data persistence
4. **DTOs**: Transfer data between layers
5. **Models**: JPA entities
6. **Enums**: Type-safe constants
7. **Exceptions**: Custom error handling

### Naming Conventions

- **Classes**: PascalCase (e.g., `VehicleController`)
- **Methods**: camelCase (e.g., `getVehicleById`)
- **Variables**: camelCase (e.g., `vehicleId`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_ATTEMPTS`)
- **Packages**: lowercase (e.g., `com.example.be.controller`)

### Error Handling

The application uses a centralized exception handling system:

- `RouteLeadException`: Base exception class
- `ResourceNotFoundException`: When resources are not found
- `ValidationException`: When input validation fails
- `GlobalExceptionHandler`: Centralized error response handling

### Validation

Input validation is handled at multiple levels:

1. **Bean Validation**: Using `@Valid` annotations
2. **Service Layer**: Business rule validation
3. **Utility Classes**: Common validation methods

## 🧪 Testing

### Running Tests

```bash
# Run all tests
./gradlew test

# Run specific test class
./gradlew test --tests VehicleControllerTest

# Run with coverage
./gradlew test jacocoTestReport
```

### Test Structure

- **Unit Tests**: Test individual components
- **Integration Tests**: Test component interactions
- **Controller Tests**: Test API endpoints

## 🔧 Configuration

### Environment Variables

- `DB_URL`: Database connection URL
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password
- `JWT_SECRET`: JWT signing secret

### Application Properties

Key configuration in `application.properties`:

```properties
# Database
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# Server
server.port=8080
```

## 📦 Dependencies

### Core Dependencies

- **Spring Boot 3.2.3**: Main framework
- **Spring Data JPA**: Data persistence
- **Spring Security**: Authentication & authorization
- **PostgreSQL**: Database
- **Lombok**: Code generation
- **JWT**: Token-based authentication

### Development Dependencies

- **Spring Boot Test**: Testing framework
- **H2 Database**: In-memory testing database
- **Mockito**: Mocking framework

## 🚀 Deployment

### Docker

```bash
# Build Docker image
docker build -t routelead-backend .

# Run container
docker run -p 8080:8080 routelead-backend
```

### Production

1. Set environment variables
2. Configure production database
3. Build with production profile
4. Deploy to your preferred platform

## 🤝 Contributing

1. Follow the coding standards
2. Write tests for new features
3. Update documentation
4. Submit pull requests

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation 