package com.cts.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponseDTO {
	private long id;
	private LocalDate appointmentDate;
	private String timeSlot;
	private String appointmentType;
	private String symptoms;
	private String additionalNotes;
	private int doctorId;
	private long patientId;
	private String status;
}