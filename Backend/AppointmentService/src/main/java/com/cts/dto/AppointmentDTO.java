package com.cts.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentDTO {

    private long id;
    
    @NotNull(message = "Appointment date is required")
    @Future(message = "Appointment date must be in the future")
    private LocalDate appointmentDate;

    @NotBlank(message = "Time slot is required")
    private String timeSlot;

    @NotBlank(message = "Appointment type is required")
    private String appointmentType;

    private String symptoms;
    private String additionalNotes;

    @NotNull(message = "Doctor ID is required")
    private Integer doctorId;

    @NotNull(message = "Patient ID is required")
    @Size()
    private Long patientId;
    
    private String status;
}