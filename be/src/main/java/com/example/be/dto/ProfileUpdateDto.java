package com.example.be.dto;

import com.example.be.types.GenderEnum;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ProfileUpdateDto {
    
    @Size(min = 1, max = 100, message = "First name must be between 1 and 100 characters")
    private String firstName;
    
    @Size(min = 1, max = 100, message = "Last name must be between 1 and 100 characters")
    private String lastName;
    
    @Pattern(regexp = "^\\+?[0-9]{9,15}$", message = "Phone number must be valid")
    private String phoneNumber;
    
    @Pattern(regexp = "^[0-9]{9}V?$|^[0-9]{12}$", message = "NIC number must be valid Sri Lankan format")
    private String nicNumber;
    
    private LocalDate dateOfBirth;
    
    private GenderEnum gender;
    
    @Size(max = 255, message = "Address line 1 must not exceed 255 characters")
    private String addressLine1;
    
    @Size(max = 255, message = "Address line 2 must not exceed 255 characters")
    private String addressLine2;
    
    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;
    
    @Pattern(regexp = "^[A-Z][0-9]{7}$", message = "Driver license number must be in format: Letter followed by 7 digits")
    private String driverLicenseNumber;
    
    private LocalDate licenseExpiryDate;
    
    @Email(message = "Email must be valid")
    private String email;
}
