# PayHere Integration Documentation

## Configuration
- **Merchant ID**: 1231712
- **Merchant Secret**: MjMwMjg1OTM5NTIyOTk2NzgwMTEyMDMyOTE3MzgzMTcxMzIyMjY5
- **Test Card**: 4242424242424242 (12/25, 404)
- **Base URL**: https://3f29eef41d7b.ngrok-free.app/api
- **Return URL**: {baseUrl}/payments/return
- **Cancel URL**: {baseUrl}/payments/cancel
- **Notify URL**: {baseUrl}/payments/webhook

**Note**: Only merchant ID and secret are provided. App ID and other credentials are not available in this sandbox setup. All URLs are constructed from the base URL to avoid duplication.

## Sandbox vs Production

### Sandbox Environment
- **No webhooks** - PayHere sandbox doesn't send webhook notifications
- **Uses return/cancel URLs** - Payment status is communicated via redirect URLs
- **Test cards only** - Use provided test card details
- **No real transactions** - All payments are simulated

### Production Environment
- **Webhooks enabled** - Real-time payment notifications
- **Return/cancel URLs** - User redirect after payment
- **Real cards** - Actual payment processing

## API Endpoints

### Initialize Payment
```
POST /api/payments/initialize
Params: bidId, requestId, userId, amount, paymentMethod
```

### Return URL (Sandbox & Production)
```
GET /api/payments/return
Handles successful payment redirects
```

### Cancel URL (Sandbox & Production)
```
GET /api/payments/cancel
Handles cancelled payment redirects
```

### Webhook (Production Only)
```
POST /api/payments/webhook
Handles PayHere payment notifications (NOT USED IN SANDBOX)
```

### Get Payment
```
GET /api/payments/{id}
```

### Get User Payments
```
GET /api/payments/user/{userId}
```

### Get Statistics
```
GET /api/payments/statistics
GET /api/payments/user/{userId}/statistics
```

## Payment Status
- PENDING
- PROCESSING
- COMPLETED
- FAILED
- REFUNDED

## Frontend Integration
1. Call initialize endpoint
2. Redirect to PayHere with form data
3. Handle return/cancel URLs
4. Process webhook updates

## Security
- MD5 hash verification
- Webhook signature validation
- Secure parameter handling
