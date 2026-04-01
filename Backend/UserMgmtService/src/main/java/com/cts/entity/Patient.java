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
public class Patient {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private String bloodType;
	private String emergencyContact;
	private String medicalHistory;
	private String allergies;
	private String homeAddress;
	private String emailId;
	private LocalDate CreatedAt;
}
