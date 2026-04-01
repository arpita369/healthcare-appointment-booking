package com.cts.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorRequestDTO {

	@Min(value = 500, message = "Fee should not be below 500 INR")
	@Max(value = 20000, message = "Fee should not be greater than 20000 INR")
	private int fee;

	@NotBlank(message = "Provide your official email id")
	@Email(message = "Please provide a valid email format")
	private String emailId;

	@NotBlank(message = "Specialization must be provided")
	private String specialization;

	private String experience;

	@NotBlank(message = "License number must not be blank")
	@Size(min = 10, max = 10, message = "License Number must be exactly 10 characters")
	private String licenseNo;

	@NotBlank(message = "Available days must be specified (e.g., MON,TUE,WED)")
	private String availableDays;

	@NotBlank(message = "Start time must be provided")
	@Pattern(regexp = "^([0-1][0-9]|2[0-3]):[0-5][0-9]$", message = "Start time must be in HH:mm format (e.g., 09:00)")
	private String startTime;

	@NotBlank(message = "End time must be provided")
	@Pattern(regexp = "^([0-1][0-9]|2[0-3]):[0-5][0-9]$", message = "End time must be in HH:mm format (e.g., 17:30)")
	private String endTime;
}