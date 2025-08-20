# PayHere URL Configuration Guide

## Overview
All PayHere API endpoints are centralized in `PayHereConfig.java` for easy management.

## Quick Configuration

### 1. Change Environment
To switch between sandbox and live environments, modify the `environment` property in `PayHereConfig.java`:

```java
// For sandbox/testing
private String environment = "sandbox";

// For production
private String environment = "live";
```

### 2. Change Base URLs (if needed)
If PayHere changes their base URLs, update these properties:

```java
// Sandbox environment
private String sandboxBaseUrl = "https://sandbox.payhere.lk";

// Live environment  
private String liveBaseUrl = "https://www.payhere.lk";
```

### 3. Change Your Application Base URL
Update your application's base URL for webhooks and redirects:

```java
private String baseUrl = "https://your-domain.com/api";
```

## Automatic URL Construction

All PayHere endpoints are automatically constructed from the base URLs:

- **Checkout API**: `{baseUrl}/pay/checkout`
- **Authorize API**: `{baseUrl}/merchant/v1/oauth/token`
- **Authorize Payment**: `{baseUrl}/pay/authorize`

## Environment-Specific Methods

Use these methods to get the correct URL for the current environment:

```java
// Get current checkout URL (sandbox or live)
String checkoutUrl = payHereConfig.getCurrentCheckoutUrl();

// Get current authorize URL (sandbox or live)
String authorizeUrl = payHereConfig.getCurrentAuthorizeUrl();

// Get current authorize payment URL (sandbox or live)
String authorizePaymentUrl = payHereConfig.getCurrentAuthorizePaymentUrl();
```

## Configuration via Properties File

You can also configure these values in `application.properties`:

```properties
# Environment setting
payhere.environment=sandbox

# Base URLs
payhere.sandbox-base-url=https://sandbox.payhere.lk
payhere.live-base-url=https://www.payhere.lk

# Your application base URL
payhere.base-url=https://your-domain.com/api

# Credentials
payhere.merchant-id=1231712
payhere.merchant-secret=your-secret
payhere.app-id=your-app-id
payhere.app-secret=your-app-secret
```

## Important Notes

1. **Environment Switching**: Only change the `environment` property to switch between sandbox and live
2. **Base URLs**: All other URLs are automatically constructed from base URLs
3. **Security**: Never commit sensitive credentials to version control
4. **Testing**: Always test in sandbox environment first

## Troubleshooting

If you encounter "Unauthorized payment request" errors:
1. Verify the environment is set correctly
2. Check that base URLs are correct
3. Ensure credentials match the environment (sandbox vs live)
4. Verify hash generation uses the correct formula
