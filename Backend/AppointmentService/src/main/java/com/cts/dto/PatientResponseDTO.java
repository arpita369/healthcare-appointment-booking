package com.cts.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientResponseDTO {   
    private long id;
    private String bloodType;
    private String emergencyContact;
    private String medicalHistory;
    private String allergies;
    private String homeAddress;
    private String emailId;
    private LocalDate createdAt;
}
