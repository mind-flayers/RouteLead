# RouteLead API Documentation

## Overview
RouteLead is a logistics platform that connects drivers with customers for parcel delivery services. This API provides endpoints for route management, bidding, vehicle management, authentication, and more.

**Base URL:** `http://localhost:8080`

## Table of Contents
1. [Authentication](#authentication)
2. [Routes Management](#routes-management)
3. [Bidding System](#bidding-system)
4. [Delivery Management](#delivery-management) ⭐ **FULLY TESTED**
5. [Vehicle Management](#vehicle-management)
6. [Driver Operations](#driver-operations)
7. [Customer Operations](#customer-operations)
8. [Admin Operations](#admin-operations)
9. [Notifications](#notifications)
10. [Health & Testing](#health--testing)
11. [Data Management](#data-management)

---

## Authentication

### Sign Up
**POST** `/api/auth/signup`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "userId": "uuid",
    "email": "user@example.com"
  },
  "token": "jwt_token_here"
}
```

### Login
**POST** `/api/auth/login`

Authenticate existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "userId": "uuid",
    "email": "user@example.com"
  },
  "token": "jwt_token_here"
}
```

---

## Routes Management

### Create Route
**POST** `/api/routes`

Create a new delivery route.

**Request Body:**
```json
{
  "driverId": "uuid",
  "originLat": 40.7128,
  "originLng": -74.0060,
  "destinationLat": 42.3601,
  "destinationLng": -71.0589,
  "departureTime": "2025-01-15T09:00:00Z",
  "detourToleranceKm": 5.0,
  "suggestedPriceMin": 20.0,
  "suggestedPriceMax": 40.0
}
```

**Response:** `201 Created`

**Notes:**
- Default status is set to `INITIATED`
- All location coordinates are required
- `driverId` and `departureTime` are required

### Get Route by ID
**GET** `/api/routes/{routeId}`

Retrieve a specific route by its ID.

**Response:**
```json
{
  "id": "uuid",
  "driverId": "uuid",
  "originLat": 40.7128,
  "originLng": -74.0060,
  "destinationLat": 42.3601,
  "destinationLng": -71.0589,
  "departureTime": "2025-01-15T09:00:00Z",
  "detourToleranceKm": 5.0,
  "suggestedPriceMin": 20.0,
  "suggestedPriceMax": 40.0,
  "status": "INITIATED"
}
```

### Update Route (PATCH)
**PATCH** `/api/routes/{routeId}?driverId={driverId}`

Partially update a route. Only provided fields will be updated.

**Request Body:**
```json
{
  "originLat": 40.7589,
  "originLng": -73.9851,
  "suggestedPriceMin": 25.0,
  "status": "OPEN"
}
```

**Response:**
```json
{
  "timestamp": "2025-01-15T10:30:00Z",
  "status": 200,
  "message": "Route updated successfully",
  "data": { /* updated route object */ },
  "path": "/api/routes/{routeId}"
}
```

### Delete Route
**DELETE** `/api/routes/{routeId}`

Delete a route. Only routes with status `OPEN` or `CANCELLED` can be deleted.

**Response:**
```json
{
  "timestamp": "2025-01-15T10:30:00Z",
  "status": 200,
  "message": "Route deleted successfully",
  "routeId": "uuid",
  "path": "/api/routes/{routeId}"
}
```

### Get Route Segments
**GET** `/api/routes/segments?routeId={routeId}`

Get route segments for a specific route.

**Response:**
```json
[
  {
    "id": "uuid",
    "routeId": "uuid",
    "segmentIndex": 0,
    "townName": "New York",
    "startLat": 40.7128,
    "startLng": -74.0060,
    "endLat": 40.7589,
    "endLng": -73.9851,
    "distanceKm": 5.2
  }
]
```

### Get Price Suggestion
**GET** `/api/routes/price-suggestion?routeId={routeId}`

Get price prediction for a route.

**Response:**
```json
{
  "routeId": "uuid",
  "predictedPrice": 35.50,
  "confidence": 0.85,
  "factors": ["distance", "time", "traffic"]
}
```

### Get Directions
**GET** `/api/routes/directions?originLat={lat}&originLng={lng}&destLat={lat}&destLng={lng}`

Get detailed directions between two points using Google Maps.

**Response:**
```json
{
  "status": "OK",
  "origin": "40.712800, -74.006000",
  "destination": "42.360100, -71.058900",
  "routes": [
    {
      "route_number": 1,
      "polyline": "encoded_polyline_string",
      "distance": "350 km",
      "duration": "3h 45m",
      "start_address": "New York, NY, USA",
      "end_address": "Boston, MA, USA",
      "summary": {
        "total_distance_meters": 350000,
        "total_duration_seconds": 13500,
        "traffic_duration": "4h 10m"
      },
      "steps": [
        {
          "instruction": "Head north on Broadway",
          "distance": "0.5 km",
          "duration": "2 min",
          "road_name": "Broadway",
          "travel_mode": "DRIVING",
          "maneuver": "TURN_LEFT",
          "step_polyline": "encoded_step_polyline"
        }
      ],
      "road_summary": {
        "total_steps": 15,
        "major_roads": ["Broadway", "I-95", "Mass Pike"]
      }
    }
  ],
  "total_routes_found": 3,
  "routes_returned": 1
}
```

### Break Polyline into Segments
**POST** `/api/routes/break-polyline?polyline={encoded_polyline}&segmentDistanceKm=10.0`

Break a polyline into segments at specified distances.

**Response:**
```json
{
  "status": "SUCCESS",
  "original_polyline": "encoded_polyline",
  "segment_distance_km": 10.0,
  "total_segments": 5,
  "segments": [
    {
      "segment_number": 1,
      "latitude": 40.7128,
      "longitude": -74.0060,
      "coordinates": "40.712800, -74.006000",
      "distance_from_start_km": 0.0
    }
  ],
  "segmented_polyline": "40.7128,-74.0060|40.7589,-73.9851"
}
```

### Test Route Creation
**POST** `/api/routes/test`

Test route creation with simplified validation.

**Request Body:** Same as Create Route

**Response:** `200 OK` with success message

---

## Bidding System

### Get All Bids
**GET** `/bids`

Get all bids in the system.

**Response:**
```json
[
  {
    "id": "uuid",
    "requestId": "uuid",
    "routeId": "uuid",
    "startIndex": 0,
    "endIndex": 1,
    "offeredPrice": 25.50,
    "status": "PENDING",
    "createdAt": "2025-01-15T10:00:00Z"
  }
]
```

### Get Bid by ID
**GET** `/bids/{bidId}`

Get a specific bid by its ID.

**Response:** Same as above (single bid object)

### Create Bid
**POST** `/bids`

Create a new bid for a parcel request.

**Request Body:**
```json
{
  "requestId": "uuid",
  "routeId": "uuid",
  "startIndex": 0,
  "endIndex": 1,
  "offeredPrice": 25.50
}
```

**Response:** Created bid object

### Update Bid Status
**PATCH** `/bids/{bidId}/status`

Update the status of a bid.

**Request Body:**
```json
{
  "status": "ACCEPTED"
}
```

**Available Statuses:** `PENDING`, `ACCEPTED`, `REJECTED`

### Delete Bid
**DELETE** `/bids/{bidId}`

Delete a bid.

**Response:** `204 No Content`

### Get Customer Bids
**GET** `/customer/bids?customerId={customerId}&status={status}`

Get bids for a specific customer.

**Query Parameters:**
- `customerId` (required): Customer UUID
- `status` (optional): Bid status filter

**Response:** Array of bid objects

### Get Bids by Parcel Request
**GET** `/customer/bids?parcel_requestid={requestId}&status={status}`

Get bids for a specific parcel request.

**Query Parameters:**
- `parcel_requestid` (required): Parcel request UUID
- `status` (optional): Bid status filter

---

## Delivery Management ⭐ **FULLY TESTED**

The Delivery Management API provides complete functionality for drivers to manage parcel deliveries from pickup to completion. This API has been comprehensively tested with a 92.3% success rate.

> 📋 **For detailed documentation, see:** [DELIVERY_MANAGEMENT_API_TESTED.md](./DELIVERY_MANAGEMENT_API_TESTED.md)

### Quick Reference

#### Get Delivery Details
**GET** `/api/delivery/{bidId}/details`

Retrieve comprehensive delivery information including customer details, parcel information, and current status.

#### Update Delivery Status  
**PUT** `/api/delivery/{bidId}/status`

Update delivery status with optional location tracking.

**Request Body:**
```json
{
  "status": "PICKED_UP",
  "currentLat": 6.9271,
  "currentLng": 79.8612,
  "notes": "Package picked up successfully"
}
```

#### Complete Delivery
**POST** `/api/delivery/{bidId}/complete`

Mark delivery as completed and generate summary.

#### Get Delivery Tracking
**GET** `/api/delivery/{bidId}/tracking`

Alternative endpoint for delivery tracking (alias for details).

### Delivery Status Flow
```
ACCEPTED → PICKED_UP → IN_TRANSIT → DELIVERED
```

### Testing Status ✅
- **Endpoint Availability:** 100% (4/4 endpoints working)
- **Error Handling:** 100% (proper HTTP status codes)
- **Input Validation:** 100% (malformed data handled correctly)
- **Performance:** 5 concurrent requests in <2 seconds
- **Frontend Integration:** 100% compatible with React Native app

### Security Features
- ✅ JWT Authentication required
- ✅ CORS support enabled
- ✅ Input validation and sanitization
- ✅ Proper error handling

---

## Vehicle Management

### Get All Vehicles
**GET** `/api/vehicles`

Get all vehicles in the system.

**Response:**
```json
[
  {
    "id": 1,
    "driverId": "uuid",
    "color": "Red",
    "make": "Toyota",
    "model": "Camry",
    "yearOfManufacture": 2020,
    "plateNumber": "ABC123",
    "maxWeightKg": 500.0,
    "maxVolumeM3": 2.5,
    "vehiclePhotos": ["photo1.jpg", "photo2.jpg"]
  }
]
```

### Get Vehicle by ID
**GET** `/api/vehicles/{id}`

Get a specific vehicle by its ID.

**Response:** Single vehicle object

### Get Vehicle by Plate Number
**GET** `/api/vehicles/plate/{plateNumber}`

Get a vehicle by its plate number.

**Response:** Single vehicle object

### Get Vehicles by Driver
**GET** `/api/vehicles/driver/{driverId}`

Get all vehicles for a specific driver.

**Response:** Array of vehicle objects

### Create Vehicle
**POST** `/api/vehicles`

Create a new vehicle.

**Request Body:**
```json
{
  "driverId": "uuid",
  "color": "Red",
  "make": "Toyota",
  "model": "Camry",
  "yearOfManufacture": 2020,
  "plateNumber": "ABC123",
  "maxWeightKg": 500.0,
  "maxVolumeM3": 2.5,
  "vehiclePhotos": ["photo1.jpg", "photo2.jpg"]
}
```

**Response:** Created vehicle object

### Update Vehicle
**PUT** `/api/vehicles/{id}`

Update a vehicle.

**Request Body:** Same as Create Vehicle

**Response:** Updated vehicle object

### Delete Vehicle
**DELETE** `/api/vehicles/{id}`

Delete a vehicle.

**Response:** `200 OK`

---

## Driver Operations

### Get Driver Routes
**GET** `/api/driver/routes?driverId={driverId}&status={status}`

Get routes for a specific driver.

**Query Parameters:**
- `driverId` (required): Driver UUID
- `status` (optional): Route status filter

**Available Statuses:** `INITIATED`, `OPEN`, `BOOKED`, `COMPLETED`, `CANCELLED`

**Response:**
```json
[
  {
    "id": "uuid",
    "driverId": "uuid",
    "originLat": 40.7128,
    "originLng": -74.0060,
    "destinationLat": 42.3601,
    "destinationLng": -71.0589,
    "departureTime": "2025-01-15T09:00:00Z",
    "status": "OPEN"
  }
]
```

### Get Driver Bid History
**GET** `/api/driver/bids/history?driverId={driverId}&status={status}`

Get bid history for a specific driver.

**Query Parameters:**
- `driverId` (required): Driver UUID
- `status` (optional): Bid status filter

**Response:**
```json
[
  {
    "bidId": "uuid",
    "requestId": "uuid",
    "routeId": "uuid",
    "offeredPrice": 25.50,
    "status": "ACCEPTED",
    "customerName": "John Doe",
    "pickupLocation": "New York",
    "dropoffLocation": "Boston"
  }
]
```

### Debug Driver Bid History
**GET** `/api/driver/bids/debug?driverId={driverId}`

Debug endpoint for driver bid history (development only).

**Response:** Raw SQL results as text

---

## Customer Operations

### Customer Dashboard
**GET** `/api/customer/dashboard`

Protected customer dashboard endpoint.

**Response:** `"Customer dashboard (protected)"`

---

## Admin Operations

### Admin Dashboard
**GET** `/api/admin/dashboard`

Protected admin dashboard endpoint.

**Response:** `"Admin dashboard (protected)"`

### Get All Users
**GET** `/api/admin/users`

Get all user profiles (admin only).

**Response:**
```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "role": "DRIVER",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1234567890",
    "isVerified": true
  }
]
```

### Get User by ID
**GET** `/api/admin/users/{id}`

Get a specific user profile by ID (admin only).

**Response:** Single user profile object

---

## Notifications

### Get User Notifications
**GET** `/notifications?userId={userId}`

Get notifications for a specific user.

**Response:**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "type": "BID_ACCEPTED",
    "title": "Bid Accepted",
    "message": "Your bid has been accepted",
    "isRead": false,
    "createdAt": "2025-01-15T10:00:00Z"
  }
]
```

### Create Notification
**POST** `/notifications`

Create a new notification.

**Request Body:**
```json
{
  "userId": "uuid",
  "type": "BID_ACCEPTED",
  "title": "Bid Accepted",
  "message": "Your bid has been accepted"
}
```

**Response:** Created notification object

### Mark Notification as Read
**PATCH** `/notifications/{id}/read`

Mark a notification as read/unread.

**Request Body:**
```json
{
  "isRead": true
}
```

**Response:** Updated notification object

---

## Health & Testing

### Google Maps API Status
**GET** `/api/health/maps/status`

Check Google Maps API connectivity.

**Response:**
```json
{
  "status": "SUCCESS",
  "message": "Google Maps API is working correctly",
  "testLocation": "New York City",
  "geocodingResult": "New York, NY, USA",
  "timestamp": 1642248000000
}
```

### Test Directions API
**POST** `/api/health/maps/test-directions?originLat=40.7128&originLng=-74.0060&destLat=34.0522&destLng=-118.2437`

Test Google Maps Directions API.

**Response:**
```json
{
  "status": "SUCCESS",
  "message": "Directions API is working correctly",
  "origin": "40.7128, -74.0060",
  "destination": "34.0522, -118.2437",
  "routesCount": 1,
  "totalDistance": "4,500 km",
  "totalDuration": "2 days 3 hours"
}
```

### Test Geocoding API
**GET** `/api/health/maps/test-geocoding?address=New York City`

Test Google Maps Geocoding API.

**Response:**
```json
{
  "status": "SUCCESS",
  "message": "Geocoding API is working correctly",
  "testAddress": "New York City",
  "reverseGeocodingResult": "New York, NY, USA"
}
```

---

## Data Management

### Load Sample Data
**POST** `/api/test/load-sample-data`

Load sample data for testing purposes.

**Response:**
```json
"Sample data loaded successfully. Total rows inserted: 7"
```

---

## Status Enums

### Route Status
- `INITIATED` - Route has been created but not yet open for bidding
- `OPEN` - Route is open for bidding
- `BOOKED` - Route has been booked with a customer
- `COMPLETED` - Route has been completed
- `CANCELLED` - Route has been cancelled

### Bid Status
- `PENDING` - Bid is waiting for customer response
- `ACCEPTED` - Bid has been accepted by customer
- `REJECTED` - Bid has been rejected by customer

### User Roles
- `DRIVER` - Can create routes and place bids
- `CUSTOMER` - Can create parcel requests and accept bids
- `ADMIN` - Can manage users and system settings

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "timestamp": "2025-01-15T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Required field is missing",
  "path": "/api/routes"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

---

## Rate Limiting

The API implements rate limiting to prevent abuse. Please respect reasonable request frequencies.

---

## Support

For API support or questions, please contact the development team.