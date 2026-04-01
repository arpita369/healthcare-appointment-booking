package com.cts.controller;

import com.cts.dto.FeedbackDTO;
import com.cts.dto.FeedbackResponseDTO;
import com.cts.service.FeedbackService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class FeedbackControllerTest {

	@Mock
	private FeedbackService feedbackService;

	@InjectMocks
	private FeedbackController feedbackController;

	@BeforeEach
	void setUp() {
		MockitoAnnotations.openMocks(this);
	}

	@Test
	void testSaveFeedback() {
		FeedbackDTO feedbackDTO = new FeedbackDTO();
		FeedbackResponseDTO responseDTO = new FeedbackResponseDTO();

		when(feedbackService.saveFeedback(feedbackDTO, "Bearer token")).thenReturn(responseDTO);

		ResponseEntity<FeedbackResponseDTO> response = feedbackController.saveFeedback(feedbackDTO, "Bearer token");

		assertEquals(HttpStatus.CREATED, response.getStatusCode());
		assertEquals(responseDTO, response.getBody());
		verify(feedbackService).saveFeedback(feedbackDTO, "Bearer token");
	}

	@Test
	void testGetAllFeedbacks() {
		List<FeedbackResponseDTO> feedbackList = List.of(new FeedbackResponseDTO(), new FeedbackResponseDTO());
		when(feedbackService.getAllFeedbacks()).thenReturn(feedbackList);

		ResponseEntity<List<FeedbackResponseDTO>> response = feedbackController.getAllFeedbacks();

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(feedbackList, response.getBody());
		verify(feedbackService).getAllFeedbacks();
	}

	@Test
	void testGetFeedbackByIdFound() {
		FeedbackResponseDTO feedback = new FeedbackResponseDTO();
		when(feedbackService.getFeedbackById(1)).thenReturn(feedback);

		ResponseEntity<?> response = feedbackController.getFeedbackById(1);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(feedback, response.getBody());
		verify(feedbackService).getFeedbackById(1);
	}

	@Test
	void testGetFeedbackByIdNotFound() {
		when(feedbackService.getFeedbackById(999)).thenReturn(null);

		ResponseEntity<?> response = feedbackController.getFeedbackById(999);

		assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
		assertNull(response.getBody());
		verify(feedbackService).getFeedbackById(999);
	}

	@Test
	void testDeleteFeedback() {
		doNothing().when(feedbackService).deleteFeedback(1);

		ResponseEntity<Void> response = feedbackController.deleteFeedback(1);

		assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
		verify(feedbackService).deleteFeedback(1);
	}

	@Test
	void testGetFeedbacksByDoctor() {
		List<FeedbackResponseDTO> feedbackList = List.of(new FeedbackResponseDTO());
		when(feedbackService.getFeedbacksByDoctor(101)).thenReturn(feedbackList);

		ResponseEntity<List<FeedbackResponseDTO>> response = feedbackController.getFeedbacksByDoctor(101);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(feedbackList, response.getBody());
		verify(feedbackService).getFeedbacksByDoctor(101);
	}

	@Test
	void testGetFeedbacksByPatient() {
		List<FeedbackResponseDTO> feedbackList = List.of(new FeedbackResponseDTO());
		when(feedbackService.getFeedbacksByPatient(202)).thenReturn(feedbackList);

		ResponseEntity<List<FeedbackResponseDTO>> response = feedbackController.getFeedbacksByPatient(202);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(feedbackList, response.getBody());
		verify(feedbackService).getFeedbacksByPatient(202);
	}
}
