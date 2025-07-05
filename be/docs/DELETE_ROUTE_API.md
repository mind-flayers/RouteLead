# DELETE Route API Implementation

## Overview
This document describes the implementation of the DELETE `/api/routes/{routeId}` endpoint for the RouteLead backend API.

## API Endpoint
**DELETE** `/api/routes/{routeId}`

## Description
Deletes a route by its unique identifier with proper business logic validation and cascade deletion of related entities.

## Path Parameters
- `routeId` (UUID, required): The unique identifier of the route to delete

## Business Rules
1. **Status Validation**: Only routes with status `OPEN` or `CANCELLED` can be deleted
2. **Status Restriction**: Routes with status `BOOKED` or `COMPLETED` cannot be deleted
3. **Cascade Deletion**: Associated route segments are automatically deleted
4. **Data Integrity**: The deletion maintains referential integrity in the database

## Response Codes

### Success (200 OK)
```json
{
  "timestamp": "2025-07-04T10:30:00.123",
  "status": 200,
  "message": "Route deleted successfully",
  "routeId": "123e4567-e89b-12d3-a456-426614174000",
  "path": "/api/routes/123e4567-e89b-12d3-a456-426614174000"
}
```

### Route Not Found (404 Not Found)
```json
{
  "timestamp": "2025-07-04T10:30:00.123",
  "status": 404,
  "error": "Not Found",
  "message": "Route not found with ID: 123e4567-e89b-12d3-a456-426614174000",
  "path": "/api/routes/123e4567-e89b-12d3-a456-426614174000"
}
```

### Business Rule Violation (400 Bad Request)
```json
{
  "timestamp": "2025-07-04T10:30:00.123",
  "status": 400,
  "error": "Bad Request",
  "message": "Cannot delete route with status: BOOKED. Only OPEN or CANCELLED routes can be deleted.",
  "path": "/api/routes/123e4567-e89b-12d3-a456-426614174000"
}
```

### Server Error (500 Internal Server Error)
```json
{
  "timestamp": "2025-07-04T10:30:00.123",
  "status": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred while deleting the route",
  "details": "Database connection error",
  "path": "/api/routes/123e4567-e89b-12d3-a456-426614174000"
}
```

## Implementation Details

### Controller Layer (`RouteController.java`)
- **Method**: `deleteRoute(@PathVariable UUID routeId)`
- **Endpoint**: `@DeleteMapping("/{routeId}")`
- **Error Handling**: Comprehensive try-catch with appropriate HTTP status codes
- **Logging**: Detailed logging for debugging and monitoring

### Service Layer (`RouteService.java`)
- **Method**: `deleteRoute(UUID routeId)`
- **Transaction**: `@Transactional` for data consistency
- **Validation**: Business logic validation before deletion
- **Cascade**: Explicit deletion of related route segments

### Database Impact
1. **Primary Deletion**: Route record from `return_routes` table
2. **Cascade Deletion**: Related records from `route_segments` table
3. **Foreign Key Constraints**: Maintained through proper cascade configuration

## Testing with Postman

### Test Cases Included
1. **5.5. Delete Route**: Successful deletion of a valid route
2. **5.6. Delete Route - Invalid Status Test**: Testing business rule validation

### Test Scenarios
1. **Valid Deletion**:
   - Create a route (status: OPEN)
   - Delete the route
   - Verify successful deletion

2. **Status Validation**:
   - Create a route
   - Update status to BOOKED
   - Attempt deletion (should fail)
   - Update status back to OPEN
   - Delete successfully

3. **Not Found**:
   - Attempt to delete a non-existent route ID
   - Verify 404 response

## Database Schema Reference

### Tables Affected
- **Primary**: `return_routes` 
- **Cascade**: `route_segments` (ON DELETE CASCADE)
- **Related**: `bids`, `price_predictions` (may have foreign key references)

### Route Status Enum
```sql
CREATE TYPE route_status AS ENUM ('OPEN','BOOKED','COMPLETED','CANCELLED');
```

## Security Considerations
- **Input Validation**: UUID format validation
- **Authorization**: Should be implemented to ensure only route owners/admins can delete
- **Audit Trail**: Consider adding audit logging for route deletions

## Performance Notes
- **Index Usage**: Uses primary key index for route lookup
- **Transaction Scope**: Minimal transaction scope for optimal performance
- **Cascade Performance**: Automatic cascade deletion is efficient for small datasets

## Future Enhancements
1. **Soft Delete**: Consider implementing soft delete instead of hard delete
2. **Audit Trail**: Add deletion audit logs
3. **Permission Check**: Implement role-based access control
4. **Bulk Operations**: Support for bulk deletion
5. **Recovery**: Implement route recovery functionality

## Related APIs
- **GET** `/api/routes/{routeId}` - Retrieve route details
- **PUT** `/api/routes/{routeId}` - Update route information
- **POST** `/api/routes` - Create new route

## Error Handling Best Practices
1. Always return consistent error response format
2. Include relevant error codes and messages
3. Log errors for debugging
4. Don't expose sensitive system information in error messages
5. Use appropriate HTTP status codes
