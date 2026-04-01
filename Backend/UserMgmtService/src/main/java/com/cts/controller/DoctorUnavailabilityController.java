package com.cts.controller;

import com.cts.dto.DoctorUnavailabilityRequestDTO;
import com.cts.dto.DoctorUnavailabilityResponseDTO;
import com.cts.service.DoctorUnavailabilityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/doctors/availability")
@Tag(name = "Doctor Availability", description = "Manage doctor unavailability for next week")
public class DoctorUnavailabilityController {
	private static final Logger log = LoggerFactory.getLogger(DoctorController.class);

	private DoctorUnavailabilityService unavailabilityService;

	public DoctorUnavailabilityController(DoctorUnavailabilityService unavailabilityService) {
		this.unavailabilityService = unavailabilityService;
	}

	@PostMapping("/{doctorId}/unavailable")
	@Operation(summary = "Declare Unavailability for Next Week", description = "Declare a doctor's unavailability for a specific day in the upcoming week.")
	public ResponseEntity<DoctorUnavailabilityResponseDTO> declareUnavailability(@PathVariable int doctorId,
			@RequestBody @Valid DoctorUnavailabilityRequestDTO requestDto, String authHeader) {
		log.info("Received request to declare unavailability for doctor ID: {}", doctorId);
		DoctorUnavailabilityResponseDTO savedDto = unavailabilityService.declareUnavailabilityForNextWeek(doctorId,
				requestDto, authHeader);
		log.info("Unavailability declared successfully for doctor ID: {}", doctorId);
		return ResponseEntity.ok(savedDto);
	}

	@GetMapping("/{doctorId}")
	@Operation(summary = "Get Unavailability by Doctor ID", description = "Retrieve all unavailability records for a specific doctor.")
	public ResponseEntity<List<DoctorUnavailabilityResponseDTO>> getUnavailability(@PathVariable int doctorId) {
		log.info("Fetching unavailability records for doctor ID: {}", doctorId);
		List<DoctorUnavailabilityResponseDTO> unavailabilityList = unavailabilityService
				.getUnavailabilityByDoctorId(doctorId);
		log.info("Fetched {} unavailability records for doctor ID: {}", unavailabilityList.size(), doctorId);
		return ResponseEntity.ok(unavailabilityList);
	}

	@GetMapping("/{doctorId}/unavailable/date")
	@Operation(summary = "Get Unavailability by Doctor ID and Date", description = "Check if a doctor is unavailable on a specific date.")
	public ResponseEntity<List<DoctorUnavailabilityResponseDTO>> getUnavailabilityByDate(@PathVariable int doctorId,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

		log.info("Checking unavailability for doctor ID: {} on date: {}", doctorId, date);

		List<DoctorUnavailabilityResponseDTO> dtoList = unavailabilityService
				.getUnavailabilityByDoctorIdAndDate(doctorId, date);

		if (dtoList.isEmpty()) {
			log.info("No unavailability found for doctor {} on {}.", doctorId, date);
			return ResponseEntity.noContent().build();
		} else {
			log.info("Found {} unavailability records for doctor {} on {}.", dtoList.size(), doctorId, date);
			return ResponseEntity.ok(dtoList);
		}
	}
}
