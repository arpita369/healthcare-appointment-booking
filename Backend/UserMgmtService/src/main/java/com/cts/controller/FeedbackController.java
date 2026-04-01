package com.cts.controller;

import com.cts.dto.FeedbackDTO;
import com.cts.dto.FeedbackResponseDTO;
import com.cts.service.FeedbackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/feedbacks")
@Tag(name = "Feedback Management", description = "Operations related to feedback from patients and doctors")
public class FeedbackController {

	private FeedbackService feedbackService;
	private static final Logger log = LoggerFactory.getLogger(FeedbackController.class);

	public FeedbackController(FeedbackService feedbackService) {
		this.feedbackService = feedbackService;
	}

	@PostMapping
	@Operation(summary = "Submit Feedback", description = "Allows a patient to submit feedback for a doctor")
	public ResponseEntity<FeedbackResponseDTO> saveFeedback(@RequestBody @Valid FeedbackDTO feedbackDTO,
			@RequestHeader("Authorization") String authHeader) {
		log.info("Received request to submit feedback");
		FeedbackResponseDTO savedFeedback = feedbackService.saveFeedback(feedbackDTO, authHeader);
		log.info("Successfully created feedback with ID: {}", savedFeedback.getId());
		return new ResponseEntity<>(savedFeedback, HttpStatus.CREATED);
	}

	@GetMapping
	@Operation(summary = "Get All Feedbacks", description = "Retrieves all feedback entries")
	public ResponseEntity<List<FeedbackResponseDTO>> getAllFeedbacks() {
		log.info("Received request to get all feedbacks");
		return new ResponseEntity<>(feedbackService.getAllFeedbacks(), HttpStatus.OK);
	}

	@GetMapping("/{id}")
	@Operation(summary = "Get Feedback by ID", description = "Retrieves a specific feedback entry by its ID")
	public ResponseEntity<?> getFeedbackById(@PathVariable int id) {
		log.info("Received request to get feedback by ID: {}", id);

		FeedbackResponseDTO feedback = feedbackService.getFeedbackById(id);
		if (feedback == null) {
			log.warn("Feedback not found for ID: {}", id);
			return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
		}
		log.info("Successfully retrieved feedback for ID: {}", id);
		return new ResponseEntity<>(feedback, HttpStatus.OK);
	}

	@DeleteMapping("/{id}")
	@Operation(summary = "Delete Feedback", description = "Deletes a feedback entry by its ID")
	public ResponseEntity<Void> deleteFeedback(@PathVariable int id) {
		log.info("Received request to delete feedback by ID: {}", id);

		feedbackService.deleteFeedback(id);
		log.info("Successfully deleted feedback with ID: {}", id);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/doctor/{doctorId}")
	@Operation(summary = "Get Feedbacks by Doctor", description = "Retrieves all feedback entries for a specific doctor")
	public ResponseEntity<List<FeedbackResponseDTO>> getFeedbacksByDoctor(@PathVariable int doctorId) {
		log.info("Received request to get feedbacks for doctor ID: {}", doctorId);
		return new ResponseEntity<>(feedbackService.getFeedbacksByDoctor(doctorId), HttpStatus.OK);
	}

	@GetMapping("/patient/{patientId}")
	@Operation(summary = "Get Feedbacks by Patient", description = "Retrieves all feedback entries submitted by a specific patient")
	public ResponseEntity<List<FeedbackResponseDTO>> getFeedbacksByPatient(@PathVariable int patientId) {
		log.info("Found {} feedbacks for patient ID: {}", patientId);
		return new ResponseEntity<>(feedbackService.getFeedbacksByPatient(patientId), HttpStatus.OK);
	}
}
