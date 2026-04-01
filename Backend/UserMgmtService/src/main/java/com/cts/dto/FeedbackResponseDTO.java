package com.cts.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackResponseDTO {
	private int id;
	private String notes;
	private int rating;
	private int doctor;
	private long patient;
	private LocalDate feedbackDate;
}