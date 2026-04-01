package com.cts.dto;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private String emailId;
    @Enumerated(EnumType.STRING)
    private Role userRole;
    private String name;
    private String dateOfBirth;
    private String gender;
    private String phoneNumber;
    private String address;
    private String avatar;
    private boolean status;
}
