# Vehicle API Documentation

## Overview
The Vehicle API provides comprehensive endpoints to manage vehicle information for drivers in the RouteLead application. This API follows RESTful conventions and includes proper validation, error handling, and logging.

## Base URL
```
http://localhost:8080/api/v1/vehicles
```

## Authentication
**Note**: Currently, all endpoints are publicly accessible for development purposes. Authentication will be enabled for production.

## Endpoints

### 1. Get All Vehicles
**GET** `/api/v1/vehicles`

Retrieves all vehicles in the system.

#### Response
- **200 OK**: List of all vehicles

#### Example Response
```json
[
  {
    "id": 1,
    "driverId": "550e8400-e29b-41d4-a716-446655440000",
    "color": "White",
    "make": "Toyota",
    "model": "Camry",
    "yearOfManufacture": 2020,
    "plateNumber": "ABC123",
    "maxWeightKg": 500.00,
    "maxVolumeM3": 2.5,
    "vehiclePhotos": ["photo1.jpg", "photo2.jpg"],
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-01T10:00:00Z"
  }
]
```

### 2. Get Vehicle by ID
**GET** `/api/v1/vehicles/{id}`

Retrieves a specific vehicle by its ID.

#### Path Parameters
- `id` (Long): Vehicle ID

#### Response
- **200 OK**: Vehicle details
- **404 Not Found**: Vehicle not found

#### Example Request
```
GET /api/v1/vehicles/1
```

### 3. Get Vehicle by Plate Number
**GET** `/api/v1/vehicles/plate/{plateNumber}`

Retrieves a vehicle by its plate number.

#### Path Parameters
- `plateNumber` (String): Vehicle license plate number

#### Response
- **200 OK**: Vehicle details
- **404 Not Found**: Vehicle not found

#### Example Request
```
GET /api/v1/vehicles/plate/ABC123
```

### 4. Get Vehicles by Driver ID
**GET** `/api/v1/vehicles/driver/{driverId}`

Retrieves all vehicles belonging to a specific driver.

#### Path Parameters
- `driverId` (UUID): The driver's unique identifier

#### Response
- **200 OK**: List of vehicles for the driver
- **400 Bad Request**: Invalid driver ID format

#### Example Request
```
GET /api/v1/vehicles/driver/550e8400-e29b-41d4-a716-446655440000
```

### 5. Create Vehicle
**POST** `/api/v1/vehicles`

Creates a new vehicle for a driver.

#### Request Body
```json
{
  "driverId": "550e8400-e29b-41d4-a716-446655440000",
  "color": "White",
  "make": "Toyota",
  "model": "Camry",
  "yearOfManufacture": 2020,
  "plateNumber": "ABC123",
  "maxWeightKg": 500.00,
  "maxVolumeM3": 2.5,
  "vehiclePhotos": ["photo1.jpg", "photo2.jpg"]
}
```

#### Required Fields
- `driverId`: UUID of the driver (required)
- `make`: Vehicle manufacturer (required)
- `model`: Vehicle model (required)
- `plateNumber`: Vehicle license plate number (required)

#### Optional Fields
- `color`: Vehicle color
- `yearOfManufacture`: Year the vehicle was manufactured
- `maxWeightKg`: Maximum weight capacity in kilograms (defaults to 0.00)
- `maxVolumeM3`: Maximum volume capacity in cubic meters (defaults to 0.00)
- `vehiclePhotos`: Array of strings containing vehicle photo URLs (defaults to empty array)

#### Response
- **201 Created**: Vehicle created successfully
- **400 Bad Request**: Invalid or missing required fields
- **500 Internal Server Error**: Server error

#### Example Response
```json
{
  "id": 1,
  "driverId": "550e8400-e29b-41d4-a716-446655440000",
  "color": "White",
  "make": "Toyota",
  "model": "Camry",
  "yearOfManufacture": 2020,
  "plateNumber": "ABC123",
  "maxWeightKg": 500.00,
  "maxVolumeM3": 2.5,
  "vehiclePhotos": ["photo1.jpg", "photo2.jpg"],
  "createdAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2024-01-01T10:00:00Z"
}
```

### 6. Update Vehicle
**PUT** `/api/v1/vehicles/{id}`

Updates an existing vehicle.

#### Path Parameters
- `id` (Long): Vehicle ID

#### Request Body
```json
{
  "color": "Blue",
  "make": "Toyota",
  "model": "Camry",
  "yearOfManufacture": 2021,
  "plateNumber": "XYZ789",
  "maxWeightKg": 600.00,
  "maxVolumeM3": 3.0,
  "vehiclePhotos": ["url1", "url2"]
}
```

#### Response
- **200 OK**: Vehicle updated successfully
- **404 Not Found**: Vehicle not found
- **500 Internal Server Error**: Server error

### 7. Delete Vehicle
**DELETE** `/api/v1/vehicles/{id}`

Deletes a vehicle.

#### Path Parameters
- `id` (Long): Vehicle ID

#### Response
- **200 OK**: Vehicle deleted successfully
- **404 Not Found**: Vehicle not found
- **500 Internal Server Error**: Server error

## Data Model

### Vehicle Entity
```java
{
  "id": Long,                    // Auto-generated primary key
  "driverId": UUID,              // Driver's unique identifier (required)
  "color": String,               // Vehicle color (optional)
  "make": String,                // Vehicle manufacturer (required)
  "model": String,               // Vehicle model (required)
  "yearOfManufacture": Integer,  // Manufacturing year (optional)
  "plateNumber": String,         // License plate number (required)
  "maxWeightKg": BigDecimal,     // Max weight capacity (default: 0.00)
  "maxVolumeM3": BigDecimal,     // Max volume capacity (default: 0.00)
  "vehiclePhotos": List<String>, // Array of photo URLs (default: empty array)
  "createdAt": ZonedDateTime,    // Creation timestamp (auto-generated)
  "updatedAt": ZonedDateTime     // Last update timestamp (auto-generated)
}
```

## Error Handling

All endpoints return consistent error responses with the following structure:

```json
{
  "timestamp": "2024-01-01T10:00:00Z",
  "status": 404,
  "error": "Not Found",
  "path": "/api/v1/vehicles/999"
}
```

### HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `404`: Not Found
- `500`: Internal Server Error

## Validation Rules

### Vehicle Creation/Update Validation

1. **driverId**: Must be a valid UUID (required)
2. **make**: Required, cannot be null or empty
3. **model**: Required, cannot be null or empty
4. **plateNumber**: Required, cannot be null or empty
5. **color**: Optional
6. **yearOfManufacture**: Optional, must be a valid year
7. **maxWeightKg**: Optional, defaults to 0.00
8. **maxVolumeM3**: Optional, defaults to 0.00
9. **vehiclePhotos**: Optional, must be an array of strings (not a JSON string)

## Important Notes

### vehiclePhotos Field
The `vehiclePhotos` field is stored as a JSONB array in the database and should be sent as a JSON array, not a JSON string:

**Correct:**
```json
{
  "vehiclePhotos": ["photo1.jpg", "photo2.jpg"]
}
```

**Incorrect:**
```json
{
  "vehiclePhotos": "[\"photo1.jpg\", \"photo2.jpg\"]"
}
```

## Testing

### Test the API

1. **Start the application**:
   ```bash
   cd be
   ./gradlew bootRun
   ```

2. **Use curl or Postman**:
   ```bash
   # Get all vehicles
   curl -X GET http://localhost:8080/api/v1/vehicles
   
   # Create a vehicle
   curl -X POST http://localhost:8080/api/v1/vehicles \
     -H "Content-Type: application/json" \
     -d '{
       "driverId": "550e8400-e29b-41d4-a716-446655440000",
       "make": "Toyota",
       "model": "Camry",
       "plateNumber": "ABC123",
       "vehiclePhotos": ["photo1.jpg", "photo2.jpg"]
     }'
   
   # Get vehicle by plate number
   curl -X GET http://localhost:8080/api/v1/vehicles/plate/ABC123
   ```

### Run Tests

```bash
# Run all tests
./gradlew test

# Run vehicle tests only
./gradlew test --tests VehicleControllerTest
```

## Versioning

This API follows semantic versioning. The current version is v1.

- **Breaking changes**: Will result in a new major version
- **New features**: Will result in a new minor version
- **Bug fixes**: Will result in a new patch version

## Support

For API support and questions:
- Check the [main documentation](../README.md)
- Create an issue in the repository
- Contact the development team 