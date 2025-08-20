package com.example.be.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import lombok.Data;

/**
 * PayHere Configuration - Centralized URL Management
 * 
 * This class contains all PayHere API endpoints and configuration.
 * To change PayHere URLs, modify the base URLs below:
 * 
 * - sandboxBaseUrl: For sandbox/testing environment
 * - liveBaseUrl: For production environment
 * 
 * All other URLs are automatically constructed from these base URLs.
 * 
 * IMPORTANT: When switching between sandbox and live environments,
 * only change the base URLs - all other URLs will update automatically.
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "payhere")
public class PayHereConfig {
    
    // PayHere Authorize API Configuration
    // Your sandbox credentials
    private String merchantId = "1231712";
    private String merchantSecret = "MjMwMjg1OTM5NTIyOTk2NzgwMTEyMDMyOTE3MzgzMTcxMzIyMjY5";
    
    // PayHere App Credentials for Authorize API
    private String appId = "4OVxzejv6YK4JFnJo04tIQ3PT";
    private String appSecret = "8gld9OjGtMc4JHM62sunMw8n4FXDeZXLM8W6XTq5YdTE";
    
    // Base URL for your application
    private String baseUrl = "https://3f29eef41d7b.ngrok-free.app/api";
    
    // Environment setting (sandbox or live)
    private String environment = "sandbox";
    
    public String getBaseUrl() {
        return baseUrl;
    }
    
    public String getMerchantId() {
        return merchantId;
    }
    
    public String getMerchantSecret() {
        return merchantSecret;
    }
    
    public String getAppId() {
        return appId;
    }
    
    public String getAppSecret() {
        return appSecret;
    }
    
    // ============================================================================
    // BASE URL GETTERS
    // ============================================================================
    
    public String getSandboxBaseUrl() {
        return sandboxBaseUrl;
    }
    
    public String getLiveBaseUrl() {
        return liveBaseUrl;
    }
    
    public String getSandboxUrl() {
        return sandboxUrl;
    }
    
    public String getLiveUrl() {
        return liveUrl;
    }
    
    public String getAuthorizeSandboxUrl() {
        return authorizeSandboxUrl;
    }
    
    public String getAuthorizeLiveUrl() {
        return authorizeLiveUrl;
    }
    
        public String getCheckoutSandboxUrl() {
        return checkoutSandboxUrl;
    }

    public String getCheckoutLiveUrl() {
        return checkoutLiveUrl;
    }

    public String getAuthorizePaymentSandboxUrl() {
        return authorizePaymentSandboxUrl;
    }

    public String getAuthorizePaymentLiveUrl() {
        return authorizePaymentLiveUrl;
    }
    
    public String getCurrency() {
        return currency;
    }
    
    public String getTestCardNumber() {
        return testCardNumber;
    }
    
    public String getTestCardExpiry() {
        return testCardExpiry;
    }
    
    public String getTestCardCvv() {
        return testCardCvv;
    }
    
    // ============================================================================
    // PAYHERE API ENDPOINTS - CENTRALIZED CONFIGURATION
    // ============================================================================
    
    // Base URLs for PayHere environments
    private String sandboxBaseUrl = "https://sandbox.payhere.lk";
    private String liveBaseUrl = "https://www.payhere.lk";
    
    // Checkout API Endpoints (for one-time payments)
    private String checkoutSandboxUrl = sandboxBaseUrl + "/pay/checkout";
    private String checkoutLiveUrl = liveBaseUrl + "/pay/checkout";
    
    // Authorize API Endpoints (for hold-on-card operations)
    private String authorizeSandboxUrl = sandboxBaseUrl + "/merchant/v1/oauth/token";
    private String authorizeLiveUrl = liveBaseUrl + "/merchant/v1/oauth/token";
    private String authorizePaymentSandboxUrl = sandboxBaseUrl + "/pay/authorize";
    private String authorizePaymentLiveUrl = liveBaseUrl + "/pay/authorize";
    
    // Legacy URLs (for backward compatibility)
    private String sandboxUrl = checkoutSandboxUrl; // Alias for checkout
    private String liveUrl = checkoutLiveUrl; // Alias for checkout
    
    // Return/Cancel URLs (for sandbox redirects) - constructed from base URL
    public String getReturnUrl() {
        return baseUrl + "/payments/return";
    }
    
    public String getCancelUrl() {
        return baseUrl + "/payments/cancel";
    }
    
    public String getNotifyUrl() {
        return baseUrl + "/payments/webhook";
    }
    
    // Currency
    private String currency = "LKR";
    
    // Test card details for sandbox (standard PayHere test card)
    private String testCardNumber = "4242424242424242";
    private String testCardExpiry = "12/25";
    private String testCardCvv = "404";
    
    // ============================================================================
    // ENVIRONMENT SWITCHING METHODS
    // ============================================================================
    
    /**
     * Get the current environment (sandbox or live)
     * @return "sandbox" or "live"
     */
    public String getCurrentEnvironment() {
        return environment;
    }
    
    /**
     * Set the environment (sandbox or live)
     * @param env "sandbox" or "live"
     */
    public void setEnvironment(String env) {
        this.environment = env;
    }
    
    /**
     * Get the appropriate checkout URL based on current environment
     * @return sandbox or live checkout URL
     */
    public String getCurrentCheckoutUrl() {
        return getCurrentEnvironment().equals("sandbox") ? checkoutSandboxUrl : checkoutLiveUrl;
    }
    
    /**
     * Get the appropriate authorize URL based on current environment
     * @return sandbox or live authorize URL
     */
    public String getCurrentAuthorizeUrl() {
        return getCurrentEnvironment().equals("sandbox") ? authorizeSandboxUrl : authorizeLiveUrl;
    }
    
    /**
     * Get the appropriate authorize payment URL based on current environment
     * @return sandbox or live authorize payment URL
     */
    public String getCurrentAuthorizePaymentUrl() {
        return getCurrentEnvironment().equals("sandbox") ? authorizePaymentSandboxUrl : authorizePaymentLiveUrl;
    }
}
