package com.cts.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientRequestDTO {

	@NotBlank(message = "Provide your Blood Type Here")
	@Pattern(regexp = "^(A|B|AB|O)[+-]$", message = "Blood type must be valid (e.g., A+, O-, AB+)")
	private String bloodType;

	@NotBlank(message = "Emergency contact cannot be blank")
	@Size(min = 8, max = 15, message = "Specify Emergency Contact Number (8-15 digits)")
	private String emergencyContact;

	@Size(max = 1000, message = "Medical history must not exceed 1000 characters")
	private String medicalHistory;

	@Size(max = 500, message = "Allergies description must not exceed 500 characters")
	private String allergies;

	@NotBlank(message = "Please specify your Home Address")
	@Size(min = 10, max = 255, message = "Home address must be between 10 and 255 characters")
	private String homeAddress;

	@NotBlank(message = "Please provide a valid Email Id")
	@Email(message = "Email format must be valid (e.g., user@example.com)")
	private String emailId;
}