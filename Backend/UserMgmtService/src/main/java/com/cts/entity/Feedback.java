package com.cts.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Feedback {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;
	private String notes;
	private int rating;
	@ManyToOne
	@JoinColumn(name = "pemail_id")
	private Patient patient;
	@ManyToOne
	@JoinColumn(name = "demail_id")
	private Doctor doctor;
	private LocalDate feedbackDate;
}
