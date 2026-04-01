package com.cts.serviceImpl;

import com.cts.client.AuthClient;
import com.cts.dto.*;
import com.cts.entity.Doctor;
import com.cts.entity.Feedback;
import com.cts.entity.Patient;
import com.cts.exceptions.DoctorNotFoundException;
import com.cts.repository.DoctorRepository;
import com.cts.repository.FeedbackRepository;
import com.cts.repository.PatientRepository;
import com.cts.serviceimpl.FeedbackServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.modelmapper.ModelMapper;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class FeedbackServiceImplTest {

	@Mock
	private FeedbackRepository feedbackRepository;

	@Mock
	private PatientRepository patientRepository;

	@Mock
	private DoctorRepository doctorRepository;

	@Mock
	private AuthClient authClient;

	@InjectMocks
	private FeedbackServiceImpl feedbackService;

	private ModelMapper mapper = new ModelMapper();

	@BeforeEach
	void setUp() {
		MockitoAnnotations.openMocks(this);
		feedbackService = new FeedbackServiceImpl(feedbackRepository, patientRepository, doctorRepository, mapper,
				authClient);
	}

	@Test
	void testSaveFeedback_Success() {
		FeedbackDTO dto = new FeedbackDTO();
		dto.setDoctor(1);
		dto.setPatient(100L);
		dto.setNotes("Excellent service");
		dto.setRating(5);

		TokenValidationResponse token = new TokenValidationResponse(true, "patient@example.com", UserRole.PATIENT);
		when(authClient.validateToken("Bearer token")).thenReturn(token);

		Doctor doctor = new Doctor();
		doctor.setId(1);
		Patient patient = new Patient();
		patient.setId(100L);

		when(doctorRepository.findById(1)).thenReturn(Optional.of(doctor));
		when(patientRepository.findById(100L)).thenReturn(Optional.of(patient));

		Feedback feedback = new Feedback();
		feedback.setId(1);
		feedback.setDoctor(doctor);
		feedback.setPatient(patient);
		feedback.setFeedbackDate(LocalDate.now());

		when(feedbackRepository.save(any(Feedback.class))).thenReturn(feedback);

		FeedbackResponseDTO response = feedbackService.saveFeedback(dto, "Bearer token");

		assertEquals(1, response.getId());
		assertEquals(100L, response.getPatient());
		assertEquals(1, response.getDoctor());
		assertEquals(dto.getRating(), response.getRating());
	}

	@Test
	void testSaveFeedback_InvalidToken() {
		FeedbackDTO dto = new FeedbackDTO();
		dto.setDoctor(1);
		dto.setPatient(100L);

		TokenValidationResponse token = new TokenValidationResponse(false, null, null);
		when(authClient.validateToken("Bearer token")).thenReturn(token);

		assertThrows(ResponseStatusException.class, () -> feedbackService.saveFeedback(dto, "Bearer token"));
	}

	@Test
	void testSaveFeedback_WrongRole() {
		FeedbackDTO dto = new FeedbackDTO();
		dto.setDoctor(1);
		dto.setPatient(100L);

		TokenValidationResponse token = new TokenValidationResponse(true, "user@example.com", UserRole.DOCTOR);
		when(authClient.validateToken("Bearer token")).thenReturn(token);

		assertThrows(ResponseStatusException.class, () -> feedbackService.saveFeedback(dto, "Bearer token"));
	}

	@Test
	void testSaveFeedback_BadWords() {
		FeedbackDTO dto = new FeedbackDTO();
		dto.setDoctor(1);
		dto.setPatient(100L);
		dto.setNotes("bad experience");

		TokenValidationResponse token = new TokenValidationResponse(true, "patient@example.com", UserRole.PATIENT);
		when(authClient.validateToken("Bearer token")).thenReturn(token);

		Doctor doctor = new Doctor();
		doctor.setId(1);
		Patient patient = new Patient();
		patient.setId(100L);

		when(doctorRepository.findById(1)).thenReturn(Optional.of(doctor));
		when(patientRepository.findById(100L)).thenReturn(Optional.of(patient));

		assertThrows(DoctorNotFoundException.class, () -> feedbackService.saveFeedback(dto, "Bearer token"));
	}

	@Test
	void testGetFeedbackById_Found() {
		Doctor doctor = new Doctor();
		doctor.setId(1);
		Patient patient = new Patient();
		patient.setId(100L);
		Feedback feedback = new Feedback();
		feedback.setId(1);
		feedback.setDoctor(doctor);
		feedback.setPatient(patient);
		feedback.setRating(4);
		feedback.setFeedbackDate(LocalDate.now());

		when(feedbackRepository.findById(1)).thenReturn(Optional.of(feedback));

		FeedbackResponseDTO response = feedbackService.getFeedbackById(1);

		assertEquals(1, response.getId());
		assertEquals(1, response.getDoctor());
		assertEquals(100L, response.getPatient());
	}

	@Test
	void testGetFeedbackById_NotFound() {
		when(feedbackRepository.findById(999)).thenReturn(Optional.empty());
		FeedbackResponseDTO response = feedbackService.getFeedbackById(999);
		assertNull(response);
	}

	@Test
	void testDeleteFeedback() {
		doNothing().when(feedbackRepository).deleteById(1);
		feedbackService.deleteFeedback(1);
		verify(feedbackRepository).deleteById(1);
	}

	@Test
	void testGetFeedbacksByDoctor() {
		Doctor doctor = new Doctor();
		doctor.setId(1);
		Patient patient = new Patient();
		patient.setId(100L);
		Feedback feedback = new Feedback();
		feedback.setId(1);
		feedback.setDoctor(doctor);
		feedback.setPatient(patient);
		feedback.setNotes("Good");
		feedback.setRating(5);
		feedback.setFeedbackDate(LocalDate.now());

		when(feedbackRepository.findByDoctorId(1)).thenReturn(List.of(feedback));

		List<FeedbackResponseDTO> responses = feedbackService.getFeedbacksByDoctor(1);

		assertEquals(1, responses.size());
		assertEquals(1, responses.get(0).getDoctor());
	}

	@Test
	void testGetFeedbacksByPatient() {
		Doctor doctor = new Doctor();
		doctor.setId(1);
		Patient patient = new Patient();
		patient.setId(100L);
		Feedback feedback = new Feedback();
		feedback.setId(1);
		feedback.setDoctor(doctor);
		feedback.setPatient(patient);
		feedback.setNotes("Nice");
		feedback.setRating(4);
		feedback.setFeedbackDate(LocalDate.now());

		when(feedbackRepository.findByPatientId(100)).thenReturn(List.of(feedback));

		List<FeedbackResponseDTO> responses = feedbackService.getFeedbacksByPatient(100);

		assertEquals(1, responses.size());
		assertEquals(100L, responses.get(0).getPatient());
	}

	@Test
	void testGetAllFeedbacks() {
		Feedback feedback1 = new Feedback();
		feedback1.setId(1);
		feedback1.setFeedbackDate(LocalDate.of(2025, 11, 6));
		feedback1.setRating(4);
		feedback1.setDoctor(new Doctor());
		feedback1.getDoctor().setId(101);
		feedback1.setPatient(new Patient());
		feedback1.getPatient().setId(201L);

		Feedback feedback2 = new Feedback();
		feedback2.setId(2);
		feedback2.setFeedbackDate(LocalDate.of(2025, 11, 5));
		feedback2.setRating(5);
		feedback2.setDoctor(new Doctor());
		feedback2.getDoctor().setId(102);
		feedback2.setPatient(new Patient());
		feedback2.getPatient().setId(202L);

		when(feedbackRepository.findAll()).thenReturn(List.of(feedback1, feedback2));

		List<FeedbackResponseDTO> result = feedbackService.getAllFeedbacks();

		assertEquals(2, result.size());

		FeedbackResponseDTO first = result.get(0);
		assertEquals(1, first.getId());
		assertEquals(101, first.getDoctor());
		assertEquals(201, first.getPatient());
		assertEquals(4, first.getRating());

		FeedbackResponseDTO second = result.get(1);
		assertEquals(2, second.getId());
		assertEquals(102, second.getDoctor());
		assertEquals(202, second.getPatient());
		assertEquals(5, second.getRating());

		verify(feedbackRepository).findAll();
	}
}