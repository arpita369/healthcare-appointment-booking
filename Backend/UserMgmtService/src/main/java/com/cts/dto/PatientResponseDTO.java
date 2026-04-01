package com.cts.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientResponseDTO {
    private Long id;
    private String bloodType;
    private String emergencyContact;
    private String medicalHistory;
    private String allergies;
    private String homeAddress;
    private String emailId;
    private LocalDate createdAt;
}
