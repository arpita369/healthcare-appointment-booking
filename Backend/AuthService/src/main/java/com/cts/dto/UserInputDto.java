package com.cts.dto;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserInputDto {

    @NotBlank(message = "Email ID must not be blank")
    @Email(message = "Please provide a valid email format")
    private String emailId;

    @NotBlank(message = "Password must not be blank")
    private String password;

    @NotNull(message = "User role must be provided")
    @Enumerated(EnumType.STRING)
    private Role userRole;

    @NotBlank(message = "Name must not be blank")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Date of birth must not be blank")
    private String dateOfBirth;

    @NotBlank(message = "Gender must not be blank")
    @Size(max = 20, message = "Gender must not exceed 20 characters")
    private String gender;

    @NotBlank(message = "Phone number must not be blank")
    @Pattern(regexp = "^\\+?[0-9\\s\\-]{10,15}$", message = "Phone number must be a valid format (10-15 digits)")
    private String phoneNumber;

    @NotBlank(message = "Address must not be blank")
    @Size(max = 255, message = "Address must not exceed 255 characters")
    private String address; 

    private String avatar; 
}