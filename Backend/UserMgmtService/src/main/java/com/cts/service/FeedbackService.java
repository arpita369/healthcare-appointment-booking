package com.cts.service;

import com.cts.dto.FeedbackDTO;
import com.cts.dto.FeedbackResponseDTO;

import java.util.List;

public interface FeedbackService {
	public FeedbackResponseDTO saveFeedback(FeedbackDTO feedbackDTO, String authHeader);

	public List<FeedbackResponseDTO> getAllFeedbacks();

	public FeedbackResponseDTO getFeedbackById(int id);

	public void deleteFeedback(int id);

	public List<FeedbackResponseDTO> getFeedbacksByDoctor(int doctorId);

	public List<FeedbackResponseDTO> getFeedbacksByPatient(int patientId);
}