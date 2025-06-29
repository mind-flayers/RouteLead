# Vehicle API Documentation

## Overview
The Vehicle API provides comprehensive endpoints to manage vehicle information for drivers in the RouteLead application. This API follows RESTful conventions and includes proper validation, error handling, and logging.

## Base URL
```
http://localhost:8080/api/v1/vehicles
```

## Authentication
All endpoints require proper authentication. Include JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

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
    "vehiclePhotos": "[]",
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-01T10:00:00Z"
  }
]
```

### 2. Get Vehicles by Driver ID
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

### 3. Get Vehicle by ID
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

### 4. Get Vehicle by Plate Number
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
  "vehiclePhotos": "[]"
}
```

#### Required Fields
- `driverId`: UUID of the driver (required)
- `make`: Vehicle manufacturer (required, 1-100 characters)
- `model`: Vehicle model (required, 1-100 characters)
- `plateNumber`: Vehicle license plate number (required, 1-20 characters, unique)

#### Optional Fields
- `color`: Vehicle color (max 50 characters)
- `yearOfManufacture`: Year the vehicle was manufactured
- `maxWeightKg`: Maximum weight capacity in kilograms (must be positive)
- `maxVolumeM3`: Maximum volume capacity in cubic meters (must be positive)
- `vehiclePhotos`: JSON string containing vehicle photo URLs

#### Response
- **201 Created**: Vehicle created successfully
- **400 Bad Request**: Invalid or missing required fields
- **409 Conflict**: Plate number already exists

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
  "vehiclePhotos": "[]",
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
  "vehiclePhotos": "[\"url1\", \"url2\"]"
}
```

#### Response
- **200 OK**: Vehicle updated successfully
- **400 Bad Request**: Invalid data
- **404 Not Found**: Vehicle not found
- **409 Conflict**: New plate number already exists

### 7. Delete Vehicle
**DELETE** `/api/v1/vehicles/{id}`

Deletes a vehicle.

#### Path Parameters
- `id` (Long): Vehicle ID

#### Response
- **204 No Content**: Vehicle deleted successfully
- **404 Not Found**: Vehicle not found

### 8. Search Vehicles by Make and Model
**GET** `/api/v1/vehicles/search?make={make}&model={model}`

Finds vehicles by make and model.

#### Query Parameters
- `make` (String): Vehicle make (required)
- `model` (String): Vehicle model (required)

#### Response
- **200 OK**: List of matching vehicles
- **400 Bad Request**: Missing required parameters

#### Example Request
```
GET /api/v1/vehicles/search?make=Toyota&model=Camry
```

### 9. Find Vehicles by Weight Capacity
**GET** `/api/v1/vehicles/capacity/weight?minWeight={minWeight}`

Finds vehicles with minimum weight capacity.

#### Query Parameters
- `minWeight` (BigDecimal): Minimum weight capacity in kg (required, must be positive)

#### Response
- **200 OK**: List of vehicles with sufficient weight capacity
- **400 Bad Request**: Invalid weight parameter

#### Example Request
```
GET /api/v1/vehicles/capacity/weight?minWeight=500.00
```

### 10. Find Vehicles by Volume Capacity
**GET** `/api/v1/vehicles/capacity/volume?minVolume={minVolume}`

Finds vehicles with minimum volume capacity.

#### Query Parameters
- `minVolume` (BigDecimal): Minimum volume capacity in m³ (required, must be positive)

#### Response
- **200 OK**: List of vehicles with sufficient volume capacity
- **400 Bad Request**: Invalid volume parameter

#### Example Request
```
GET /api/v1/vehicles/capacity/volume?minVolume=2.5
```

## Error Handling

All endpoints return consistent error responses with the following structure:

```json
{
  "timestamp": "2024-01-01T10:00:00Z",
  "message": "Error description",
  "errorCode": "ERROR_CODE",
  "path": "/api/v1/vehicles"
}
```

### Common Error Codes

- `RESOURCE_NOT_FOUND`: Requested resource not found
- `VALIDATION_ERROR`: Input validation failed
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `INTERNAL_ERROR`: Server error

### HTTP Status Codes

- `200`: Success
- `201`: Created
- `204`: No Content
- `400`: Bad Request (validation errors)
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict (duplicate resource)
- `500`: Internal Server Error

## Validation Rules

### Vehicle Creation/Update Validation

1. **driverId**: Must be a valid UUID
2. **make**: Required, 1-100 characters
3. **model**: Required, 1-100 characters
4. **plateNumber**: Required, 1-20 characters, must be unique
5. **color**: Optional, max 50 characters
6. **yearOfManufacture**: Optional, must be a valid year
7. **maxWeightKg**: Optional, must be positive
8. **maxVolumeM3**: Optional, must be positive
9. **vehiclePhotos**: Optional, JSON string

## Rate Limiting

API requests are rate-limited to prevent abuse:
- 100 requests per minute per IP address
- 1000 requests per hour per authenticated user

## Logging

All API requests are logged with the following information:
- HTTP method and path
- Request parameters
- Response status
- Processing time
- User context (if authenticated)

## Testing

### Test the API

1. **Start the application**:
   ```bash
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
       "plateNumber": "ABC123"
     }'
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