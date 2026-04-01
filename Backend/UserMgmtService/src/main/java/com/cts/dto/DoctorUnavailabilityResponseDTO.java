package com.cts.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorUnavailabilityResponseDTO {
	private Long id;
	private LocalDate date;
	private String reason;
	private int doctorId;
	private LocalDateTime createdAt;
}
