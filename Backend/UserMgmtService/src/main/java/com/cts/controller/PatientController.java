package com.cts.controller;

import com.cts.dto.PatientRequestDTO;
import com.cts.dto.PatientResponseDTO;
import com.cts.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Tag(name = "Patient Management", description = "Operations related to patient profiles")
@RequestMapping("/api/v1/patients")
public class PatientController {

	private static final Logger log = LoggerFactory.getLogger(PatientController.class);

	private PatientService patientService;

	public PatientController(PatientService patientService) {
		this.patientService = patientService;
	}

	@PostMapping
	@Operation(summary = "Create a new Patient profile", description = "Creates a new patient profile and returns the saved patient details.")
	public ResponseEntity<PatientResponseDTO> addPatient(@RequestBody @Valid PatientRequestDTO patientDTO,
			@RequestHeader("Authorization") String authHeader) {
		log.info("Received request to create a new patient profile");
		log.debug("Request Body: {}", patientDTO); // DEBUG level for potentially large DTO

		PatientResponseDTO savedPatient = patientService.addPatient(patientDTO, authHeader);

		return ResponseEntity.ok(savedPatient);
	}

	@GetMapping
	@Operation(summary = "Get all Patient profiles", description = "Retrieves a list of all existing patient profiles.")
	public ResponseEntity<List<PatientResponseDTO>> getAllPatients() {
		log.info("Received request to get all patient profiles");

		List<PatientResponseDTO> patients = patientService.getAllPatients();

		log.info("Retrieved {} patient profiles", patients.size());
		return ResponseEntity.ok(patients);
	}

	@GetMapping("/{id}")
	@Operation(summary = "Get Patient profile by ID", description = "Retrieves the full patient profile using the patient ID.")
	public ResponseEntity<PatientResponseDTO> getPatientById(@PathVariable long id) {
		log.info("Received request to get patient profile by ID: {}", id);

		PatientResponseDTO patient = patientService.getPatientById(id);

		log.info("Successfully retrieved patient profile for ID: {}", id);
		return ResponseEntity.ok(patient);
	}

	@GetMapping("/email/{emailId}")
	@Operation(summary = "Get Patient profile by emailId", description = "Retrieves the full patient profile using the patient emailId.")
	public ResponseEntity<PatientResponseDTO> getPatientByemailId(@PathVariable String emailId) {
		log.info("Received request to get patient profile by email ID: {}", emailId);

		PatientResponseDTO patient = patientService.getPatientByemailId(emailId);

		log.info("Successfully retrieved patient profile for email: {}", emailId);
		return ResponseEntity.ok(patient);
	}

	@PutMapping("/{id}")
	@Operation(summary = "Update an existing Patient profile", description = "Updates the details of a patient profile identified by patient ID.")
	public ResponseEntity<PatientResponseDTO> updatePatient(@PathVariable long id,
			@RequestBody PatientRequestDTO patientDTO, @RequestHeader("Authorization") String authHeader) {
		log.info("Received request to update patient profile with ID: {}", id);
		log.debug("Update Request Body: {}", patientDTO);

		PatientResponseDTO updatedPatient = patientService.updatePatient(patientDTO, id, authHeader);

		log.info("Successfully updated patient profile with ID: {}", id);
		return ResponseEntity.ok(updatedPatient);
	}
}