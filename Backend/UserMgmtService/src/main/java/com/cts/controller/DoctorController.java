package com.cts.controller;

import com.cts.dto.DoctorRequestDTO;
import com.cts.dto.DoctorResponseDTO;
import com.cts.service.DoctorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/doctors")
@Tag(name = "Doctor Management", description = "Operations related to doctor profiles and availability")
public class DoctorController {

	private static final Logger log = LoggerFactory.getLogger(DoctorController.class);

	private final DoctorService doctorService;

	public DoctorController(DoctorService doctorService) {
		this.doctorService = doctorService;
	}

	@PostMapping
	@Operation(summary = "Create a new Doctor profile", description = "Creates a new doctor profile, validates if the user exists by email, and sets the user role to 'doctor'.")
	public ResponseEntity<DoctorResponseDTO> createDoctor(@RequestBody @Valid DoctorRequestDTO doctorDTO,
			@RequestHeader("Authorization") String authHeader) {
		log.info("Received request to create a new doctor profile");
		log.debug("Request Body: {}", doctorDTO); // Use DEBUG for sensitive/large data

		DoctorResponseDTO savedDoctor = doctorService.saveDoctor(doctorDTO, authHeader);

		log.info("Successfully created doctor profile with ID: {}", savedDoctor.getEmailId());
		return ResponseEntity.ok(savedDoctor);
	}

	@GetMapping
	@Operation(summary = "Get all Doctor profiles", description = "Retrieves a list of all existing doctor profiles.")
	public ResponseEntity<List<DoctorResponseDTO>> getAllDoctors() {
		log.info("Received request to get all doctor profiles");

		List<DoctorResponseDTO> doctors = doctorService.getAllDoctors();

		log.info("Retrieved {} doctor profiles", doctors.size());
		return ResponseEntity.ok(doctors);
	}

	@PutMapping("/{doctorId}")
	@Operation(summary = "Update an existing Doctor profile", description = "Updates the professional details of a doctor profile identified by doctor ID.")
	public ResponseEntity<DoctorResponseDTO> updateDoctor(@PathVariable String doctorId,
			@RequestBody DoctorRequestDTO doctorDTO, @RequestHeader("Authorization") String authHeader) {
		log.info("Received request to update doctor profile with ID: {}", doctorId);
		log.debug("Update Request Body: {}", doctorDTO);

		DoctorResponseDTO updatedDoctor = doctorService.updateDoctor(doctorId, doctorDTO, authHeader);

		log.info("Successfully updated doctor profile with ID: {}", doctorId);
		return ResponseEntity.ok(updatedDoctor);
	}

	@GetMapping("/{doctorId}")
	@Operation(summary = "Get Doctor profile by ID", description = "Retrieves the full doctor profile using the doctor ID.")
	public ResponseEntity<DoctorResponseDTO> getDoctorById(@PathVariable String doctorId) {
		log.info("Received request to get doctor profile by ID: {}", doctorId);

		DoctorResponseDTO doctor = doctorService.getDoctorByEmailId(doctorId);

		log.info("Successfully retrieved doctor profile for ID: {}", doctorId);
		return ResponseEntity.ok(doctor);
	}

	@GetMapping("/specialization/{specialization}")
	@Operation(summary = "Get Doctors by Specialization", description = "Retrieves a list of doctors based on their specialization.")
	public ResponseEntity<List<DoctorResponseDTO>> getDoctorsBySpecialization(@PathVariable String specialization) {
		log.info("Received request to get doctors by specialization: {}", specialization);

		List<DoctorResponseDTO> doctors = doctorService.getDoctorsBySpecialization(specialization);

		log.info("Found {} doctors with specialization: {}", doctors.size(), specialization);
		return ResponseEntity.ok(doctors);
	}

	@GetMapping("/available/{day}")
	@Operation(summary = "Get Doctors by Available Day", description = "Retrieves a list of doctors available on a specific day.")
	public ResponseEntity<List<DoctorResponseDTO>> getDoctorsByAvailableDay(@PathVariable String day) {
		log.info("Received request to get doctors by available day: {}", day);

		List<DoctorResponseDTO> doctors = doctorService.getDoctorsByAvailableDay(day);

		log.info("Found {} doctors available on: {}", doctors.size(), day);
		return ResponseEntity.ok(doctors);
	}

	@GetMapping("/license/{licenseNo}")
	@Operation(summary = "Get Doctor by License Number", description = "Retrieves a single doctor profile using their unique license number.")
	public ResponseEntity<DoctorResponseDTO> getDoctorByLicenseNo(@PathVariable String licenseNo) {
		log.info("Received request to get doctor by license number: {}", licenseNo);

		DoctorResponseDTO doctor = doctorService.getDoctorByLicenseNo(licenseNo);

		log.info("Successfully retrieved doctor profile for license: {}", licenseNo);
		return ResponseEntity.ok(doctor);
	}

	@GetMapping("/email/{emailId}")
	@Operation(summary = "Get Doctor profile by emailId")
	public ResponseEntity<DoctorResponseDTO> getDoctorByEmail(@PathVariable String emailId) {
		log.info("Received request to get doctor by email ID: {}", emailId);

		DoctorResponseDTO doctor = doctorService.getDoctorByEmail(emailId);

		log.info("Successfully retrieved doctor profile for email: {}", emailId);
		return ResponseEntity.ok(doctor);
	}
}