package com.cts.serviceimpl;

import com.cts.client.AuthClient;
import com.cts.dto.FeedbackDTO;
import com.cts.dto.FeedbackResponseDTO;
import com.cts.dto.TokenValidationResponse;
import com.cts.dto.UserRole;
import com.cts.entity.Doctor;
import com.cts.entity.Feedback;
import com.cts.entity.Patient;
import com.cts.exceptions.DoctorNotFoundException;
import com.cts.exceptions.PatientNotFoundException;
import com.cts.repository.DoctorRepository;
import com.cts.repository.FeedbackRepository;
import com.cts.repository.PatientRepository;
import com.cts.service.FeedbackService;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class FeedbackServiceImpl implements FeedbackService {

	private FeedbackRepository feedbackRepository;
	private PatientRepository patientRepository;
	private DoctorRepository doctorRepository;
	private ModelMapper mapper;
	private final AuthClient userClient;

	public FeedbackServiceImpl(FeedbackRepository feedbackRepository, PatientRepository patientRepository,
			DoctorRepository doctorRepository, ModelMapper mapper, AuthClient userClient) {
		this.feedbackRepository = feedbackRepository;
		this.patientRepository = patientRepository;
		this.doctorRepository = doctorRepository;
		this.mapper = mapper;
		this.userClient = userClient;
	}

	public FeedbackResponseDTO saveFeedback(FeedbackDTO feedbackDTO, String authHeader) {
		TokenValidationResponse validateResponse = userClient.validateToken(authHeader);

		if (!validateResponse.isValid())
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");

		if (!validateResponse.getUserRole().equals(UserRole.PATIENT))
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");

		if (feedbackDTO.getPatient() == 0 || feedbackDTO.getDoctor() == 0) {
			throw new IllegalArgumentException("Doctor or Patient information is missing in the feedback.");
		}

		long patientId = feedbackDTO.getPatient();
		int doctorId = feedbackDTO.getDoctor();
		Doctor doctor = doctorRepository.findById(doctorId)
				.orElseThrow(() -> new DoctorNotFoundException("Doctor with ID " + doctorId + " not found"));

		Patient patient = patientRepository.findById(patientId)
				.orElseThrow(() -> new PatientNotFoundException("Patient with ID " + patientId + " not found"));

		if (feedbackDTO.getNotes().contains("bad") || feedbackDTO.getNotes().contains("dog")) {
			throw new DoctorNotFoundException("Feedback contains wrong words");
		}

		Feedback feedback = mapper.map(feedbackDTO, Feedback.class);
		feedback.setFeedbackDate(LocalDate.now());
		feedback.setDoctor(doctor);
		feedback.setPatient(patient);
		feedback = feedbackRepository.save(feedback);

		FeedbackResponseDTO response = mapper.map(feedbackDTO, FeedbackResponseDTO.class);
		response.setNotes(feedback.getNotes());
		response.setId(feedback.getId());
		response.setFeedbackDate(feedback.getFeedbackDate());
		return response;

	}

	public List<FeedbackResponseDTO> getAllFeedbacks() {
		List<Feedback> list = feedbackRepository.findAll();
		List<FeedbackResponseDTO> responses = new ArrayList<FeedbackResponseDTO>();
		for (Feedback feedback : list) {
			FeedbackResponseDTO response = new FeedbackResponseDTO();
			response.setId(feedback.getId());
			response.setFeedbackDate(feedback.getFeedbackDate());
			response.setDoctor(feedback.getDoctor().getId());
			response.setPatient(feedback.getPatient().getId());
			response.setRating(feedback.getRating());
			response.setFeedbackDate(feedback.getFeedbackDate());
			response.setNotes(feedback.getNotes());
			responses.add(response);
		}
		return responses;
	}

	public FeedbackResponseDTO getFeedbackById(int id) {
		Feedback feedback = feedbackRepository.findById(id).orElse(null);
		if (feedback == null)
			return null;
		FeedbackResponseDTO response = new FeedbackResponseDTO();
		response.setId(feedback.getId());
		response.setFeedbackDate(feedback.getFeedbackDate());
		response.setDoctor(feedback.getDoctor().getId());
		response.setPatient(feedback.getPatient().getId());
		response.setRating(feedback.getRating());
		response.setFeedbackDate(feedback.getFeedbackDate());
		response.setNotes(feedback.getNotes());
		return response;
	}

	public void deleteFeedback(int id) {
		feedbackRepository.deleteById(id);
	}

	public List<FeedbackResponseDTO> getFeedbacksByDoctor(int doctorId) {
		List<Feedback> list = feedbackRepository.findByDoctorId(doctorId);
		List<FeedbackResponseDTO> responses = new ArrayList<FeedbackResponseDTO>();
		for (Feedback feedback : list) {
			FeedbackResponseDTO response = new FeedbackResponseDTO();
			response.setId(feedback.getId());
			response.setFeedbackDate(feedback.getFeedbackDate());
			response.setDoctor(feedback.getDoctor().getId());
			response.setPatient(feedback.getPatient().getId());
			response.setNotes(feedback.getNotes());
			response.setRating(feedback.getRating());
			response.setFeedbackDate(feedback.getFeedbackDate());
			responses.add(response);
		}
		return responses;
	}

	public List<FeedbackResponseDTO> getFeedbacksByPatient(int patientId) {
		List<Feedback> list = feedbackRepository.findByPatientId(patientId);
		List<FeedbackResponseDTO> responses = new ArrayList<FeedbackResponseDTO>();
		for (Feedback feedback : list) {
			FeedbackResponseDTO response = new FeedbackResponseDTO();
			response.setId(feedback.getId());
			response.setFeedbackDate(feedback.getFeedbackDate());
			response.setDoctor(feedback.getDoctor().getId());
			response.setPatient(feedback.getPatient().getId());
			response.setNotes(feedback.getNotes());
			response.setRating(feedback.getRating());
			response.setFeedbackDate(feedback.getFeedbackDate());
			responses.add(response);
		}
		return responses;
	}

}