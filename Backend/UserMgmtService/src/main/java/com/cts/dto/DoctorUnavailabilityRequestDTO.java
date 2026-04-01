package com.cts.dto;

import jakarta.validation.constraints.FutureOrPresent;
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
public class DoctorUnavailabilityRequestDTO {
	@NotNull(message = "Date must not be null")
	@FutureOrPresent(message = "Unavailability date must be in the present or future")
	private LocalDate date;
	@NotBlank(message = "Please provide a reason for Unavailability")
	@Size(min = 5, max = 255, message = "Reason must be between 5 and 255 characters")
	private String reason;
}
