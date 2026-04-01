package com.cts.entity;

import java.time.LocalDate;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "appointments")
public class Appointment {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;
	private int doctorId;
	private long patientId;

	@Column(name = "appointment_date", nullable = false)
	private LocalDate appointmentDate;

	@Column(name = "time_slot", nullable = false)
	private String timeSlot;

	@Column(name = "appointment_type", nullable = false)
	private String appointmentType;

	@Column(length = 1000)
	private String symptoms;

	@Column(length = 1000)
	private String additionalNotes;
	
	@Column(length = 10)
	private String status;

}
