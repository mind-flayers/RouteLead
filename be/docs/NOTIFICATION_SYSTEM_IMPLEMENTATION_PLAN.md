# RouteLead Comprehensive Notification System Implementation Plan

## Project Analysis Summary

### Current State Analysis
✅ **Existing Infrastructure:**
- Basic notification table with JSONB payload support
- NotificationController, NotificationService, NotificationRepository exist
- Basic CRUD operations: create, get by user, mark as read
- Hybrid Lombok pattern: @Getter/@Setter + explicit methods for IDE compatibility

❌ **Critical Gaps Identified:**
- No automatic notification triggers in business logic
- Limited notification types (only 5 basic types)
- No customer notification frontend page
- No integration with business events (bids, payments, messages, etc.)
- No event-driven notification system

### Current NotificationTypes (LIMITED)
```java
public enum NotificationType {
    BID_UPDATE,           // ✅ Exists but not automatically triggered
    BOOKING_CONFIRMED,    // ✅ Exists
    DELIVERY_STATUS,      // ✅ Exists but not automatically triggered  
    ROUTE_CHANGED,        // ✅ Exists
    DISPUTE_ALERT         // ✅ Exists
}
```

### Required Notifications Mapping

#### Driver Notifications
| Requirement | Current Type | Status | New Type Needed |
|-------------|--------------|--------|-----------------|
| Every bid customers give for route | BID_UPDATE | ❌ Not triggered | BID_RECEIVED |
| Messages from customers | - | ❌ Missing | MESSAGE_RECEIVED |
| Payments | - | ❌ Missing | PAYMENT_RECEIVED |
| Withdrawal received | - | ❌ Missing | WITHDRAWAL_COMPLETED |
| Verification process done | - | ❌ Missing | VERIFICATION_COMPLETED |

#### Customer Notifications  
| Requirement | Current Type | Status | New Type Needed |
|-------------|--------------|--------|-----------------|
| Bid won | - | ❌ Missing | BID_WON |
| Messages from driver | - | ❌ Missing | MESSAGE_RECEIVED |
| Delivery status changes | DELIVERY_STATUS | ❌ Not triggered | (use existing) |
| Offers | - | ❌ Missing | OFFER_RECEIVED |
| Refunds | - | ❌ Missing | REFUND_RECEIVED |

---

## Implementation Plan

### Phase 1: Backend Infrastructure Enhancement

#### 1.1 Extend NotificationType Enum
**File:** `c:\Users\User\Desktop\3.2_project\RouteLead\be\src\main\java\com\example\be\types\NotificationType.java`

**Action:** Replace existing enum with comprehensive types:
```java
public enum NotificationType {
    // Existing types (keep for compatibility)
    BID_UPDATE,
    BOOKING_CONFIRMED,
    DELIVERY_STATUS,
    ROUTE_CHANGED,
    DISPUTE_ALERT,
    
    // New Driver notification types
    BID_RECEIVED,
    MESSAGE_RECEIVED,
    PAYMENT_RECEIVED,
    WITHDRAWAL_COMPLETED,
    VERIFICATION_COMPLETED,
    
    // New Customer notification types
    BID_WON,
    BID_REJECTED,
    OFFER_RECEIVED,
    REFUND_RECEIVED,
    DELIVERY_PICKUP,
    DELIVERY_IN_TRANSIT,
    DELIVERY_DELIVERED
}
```

#### 1.2 Database Migration for New Enum Values
**File:** `c:\Users\User\Desktop\3.2_project\RouteLead\be\db\migrations\add_notification_types.sql`

**Action:** Create migration script:
```sql
-- Add new notification types to existing enum
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'BID_RECEIVED';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'MESSAGE_RECEIVED';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'PAYMENT_RECEIVED';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'WITHDRAWAL_COMPLETED';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'VERIFICATION_COMPLETED';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'BID_WON';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'BID_REJECTED';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'OFFER_RECEIVED';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'REFUND_RECEIVED';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'DELIVERY_PICKUP';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'DELIVERY_IN_TRANSIT';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'DELIVERY_DELIVERED';
```

#### 1.3 Enhanced NotificationService with Event-Driven Capabilities
**File:** `c:\Users\User\Desktop\3.2_project\RouteLead\be\src\main\java\com\example\be\service\NotificationService.java`

**Action:** Add event-driven notification methods:
```java
// Add these methods to existing NotificationService class
@Autowired
private BidRepository bidRepository;

@Autowired
private ReturnRouteRepository routeRepository;

// Driver Notifications
public void notifyDriverBidReceived(UUID routeId, UUID bidId, UUID customerId) {
    // Implementation details in plan
}

public void notifyDriverPaymentReceived(UUID driverId, BigDecimal amount, UUID bidId) {
    // Implementation details in plan
}

public void notifyDriverWithdrawalCompleted(UUID driverId, BigDecimal amount, String transactionId) {
    // Implementation details in plan
}

public void notifyDriverVerificationCompleted(UUID driverId, VerificationStatusEnum status) {
    // Implementation details in plan
}

// Customer Notifications
public void notifyCustomerBidWon(UUID customerId, UUID bidId, UUID driverId) {
    // Implementation details in plan
}

public void notifyCustomerDeliveryStatusChange(UUID customerId, UUID bidId, DeliveryStatusEnum status) {
    // Implementation details in plan
}

public void notifyCustomerRefundReceived(UUID customerId, BigDecimal amount, UUID bidId) {
    // Implementation details in plan
}

// Universal Message Notification
public void notifyUserMessageReceived(UUID recipientId, UUID senderId, UUID conversationId, String messagePreview) {
    // Implementation details in plan
}
```

#### 1.4 Integration Points in Existing Services

**BidService Integration:**
**File:** `c:\Users\User\Desktop\3.2_project\RouteLead\be\src\main\java\com\example\be\service\BidService.java`

Add notification triggers to existing methods:
- `createRouteBid()` → notify driver BID_RECEIVED
- `acceptBid()` → notify customer BID_WON  
- `rejectBid()` → notify customer BID_REJECTED

**PaymentService Integration:**
**File:** `c:\Users\User\Desktop\3.2_project\RouteLead\be\src\main\java\com\example\be\service\PaymentService.java`

Add notification triggers to:
- Payment completion → notify driver PAYMENT_RECEIVED

**EarningsService Integration:**
**File:** `c:\Users\User\Desktop\3.2_project\RouteLead\be\src\main\java\com\example\be\service\EarningsService.java`

Add notification triggers to:
- Withdrawal completion → notify driver WITHDRAWAL_COMPLETED

**Message/Chat Integration:**
**Files:** Chat-related services
Add notification triggers to:
- New message → notify recipient MESSAGE_RECEIVED

#### 1.5 New DTOs for Enhanced Notification Payloads
**File:** `c:\Users\User\Desktop\3.2_project\RouteLead\be\src\main\java\com\example\be\dto\notification\`

Create specialized payload DTOs:
```java
// BidNotificationPayload.java
// PaymentNotificationPayload.java  
// MessageNotificationPayload.java
// DeliveryNotificationPayload.java
// WithdrawalNotificationPayload.java
// VerificationNotificationPayload.java
```

### Phase 2: Frontend Implementation

#### 2.1 Customer Notifications Page
**File:** `c:\Users\User\Desktop\3.2_project\RouteLead\fe\app\pages\customer\Notifications.tsx`

**Action:** Create new customer notifications page based on driver notifications template

#### 2.2 Notification API Service Integration
**File:** `c:\Users\User\Desktop\3.2_project\RouteLead\fe\services\apiService.ts`

**Action:** Add notification API functions:
```typescript
// Notification API functions
export const getNotifications = async (userId: string)
export const markNotificationAsRead = async (notificationId: string)
export const markAllNotificationsAsRead = async (userId: string)
```

#### 2.3 Real-time Notification Updates (Optional Enhancement)
**Consideration:** Implement WebSocket or polling for real-time notifications

### Phase 3: Testing Strategy

#### 3.1 Backend Integration Tests
- Test all notification trigger points
- Verify correct payload generation
- Test database enum updates

#### 3.2 Frontend Integration Tests  
- Test notification display
- Test mark as read functionality
- Test navigation from notifications

#### 3.3 End-to-End Notification Flow Tests
- Driver receives bid notification when customer bids
- Customer receives win notification when bid accepted
- Payment notifications trigger correctly
- Message notifications work bidirectionally

---

## Implementation Guidelines

### 1. Lombok Compatibility
**Follow existing hybrid pattern:**
- Use `@Getter` and `@Setter` at class level
- Provide explicit getter/setter methods for critical properties
- This avoids lombok compilation issues while maintaining convenience

### 2. Database Safety
- Use `ADD VALUE IF NOT EXISTS` for enum additions
- Test migrations on development database first
- Maintain backward compatibility

### 3. Service Integration Safety
- Add `@Autowired NotificationService` to existing services
- Use try-catch blocks around notification calls to prevent business logic disruption
- Log notification failures for debugging

### 4. Payload Design
- Use structured DTOs for notification payloads
- Include all necessary data for frontend display
- Consider notification action buttons (e.g., "View Bid", "Reply")

### 5. Performance Considerations
- Add database indexes for notification queries
- Consider notification pagination for users with many notifications
- Implement soft delete for old notifications

---

## Risk Mitigation

### 1. Database Migration Risks
- **Risk:** Enum addition might lock table
- **Mitigation:** Run during low-traffic periods, test on staging first

### 2. Service Integration Risks  
- **Risk:** Notification failures could break business logic
- **Mitigation:** Wrap notification calls in try-catch, make them non-blocking

### 3. Performance Risks
- **Risk:** Too many notification database writes
- **Mitigation:** Consider batching notifications, async processing

### 4. Frontend Compatibility
- **Risk:** New notification types might break existing UI
- **Mitigation:** Graceful degradation for unknown types, comprehensive testing

---

## Success Criteria

### Functional Requirements Met:
✅ Driver receives notifications for all specified events
✅ Customer receives notifications for all specified events  
✅ Notifications display with proper context and actions
✅ Mark as read functionality works
✅ No breaking changes to existing functionality

### Technical Requirements Met:
✅ Follows existing architecture patterns
✅ Uses hybrid lombok pattern consistently
✅ Database migrations are safe and reversible
✅ Performance impact is minimal
✅ Code is maintainable and testable

---

## Implementation Priority

### High Priority (MVP):
1. Extend NotificationType enum
2. Add basic notification triggers to BidService  
3. Create customer notifications page
4. Basic API integration

### Medium Priority:
1. Payment and withdrawal notifications
2. Message notifications
3. Delivery status notifications
4. Enhanced notification payloads

### Low Priority (Future Enhancements):
1. Real-time notifications via WebSocket
2. Notification preferences/settings
3. Push notifications for mobile
4. Notification analytics and insights

---

This plan provides a comprehensive roadmap for implementing the notification system while following the existing architectural patterns and avoiding lombok-related issues through the established hybrid approach.
