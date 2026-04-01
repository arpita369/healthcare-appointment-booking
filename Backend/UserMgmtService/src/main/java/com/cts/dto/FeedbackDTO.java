package com.cts.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackDTO {
	private int doctor;
	private long patient;

	@NotBlank(message = "Note should not be blank")
	@Size(min = 10, message = "Please specify feedback minimum 10 characters")
	private String notes;

	@Min(value = 1, message = "Rating between 1 and 10")
	@Max(value = 10, message = "Rating between 1 and 10")
	private int rating;
}