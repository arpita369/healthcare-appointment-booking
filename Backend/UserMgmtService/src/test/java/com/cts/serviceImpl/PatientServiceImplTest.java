package com.cts.serviceImpl;

import com.cts.client.AuthClient;
import com.cts.dto.*;
import com.cts.entity.Patient;
import com.cts.exceptions.PatientNotFoundException;
import com.cts.repository.PatientRepository;
import com.cts.serviceimpl.PatientServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PatientServiceImplTest {

	@Mock
	private PatientRepository patientRepository;

	@Mock
	private AuthClient authClient;

	@InjectMocks
	private PatientServiceImpl patientService;

	@BeforeEach
	void setUp() {
		MockitoAnnotations.openMocks(this);
	}

	@Test
	void testAddPatient_Success() {
		PatientRequestDTO requestDTO = new PatientRequestDTO();
		requestDTO.setEmailId("test@example.com");

		TokenValidationResponse tokenResponse = new TokenValidationResponse();
		tokenResponse.setValid(true);
		tokenResponse.setEmailId("test@example.com");
		tokenResponse.setUserRole(UserRole.PATIENT);

		when(authClient.validateToken(anyString())).thenReturn(tokenResponse);
		when(patientRepository.findByEmailId("test@example.com")).thenReturn(null);

		Patient patient = new Patient();
		patient.setId(1L);
		patient.setEmailId("test@example.com");
		patient.setCreatedAt(LocalDate.now());

		when(patientRepository.save(any(Patient.class))).thenReturn(patient);

		PatientResponseDTO response = patientService.addPatient(requestDTO, "Bearer token");

		assertNotNull(response);
		assertEquals("test@example.com", response.getEmailId());
	}

	@Test
	void testAddPatient_AlreadyExists() {
		TokenValidationResponse tokenResponse = new TokenValidationResponse();
		tokenResponse.setValid(true);
		tokenResponse.setEmailId("test@example.com");
		tokenResponse.setUserRole(UserRole.PATIENT);

		when(authClient.validateToken(anyString())).thenReturn(tokenResponse);
		when(patientRepository.findByEmailId("test@example.com")).thenReturn(new Patient());

		PatientRequestDTO requestDTO = new PatientRequestDTO();
		requestDTO.setEmailId("test@example.com");

		assertThrows(ResponseStatusException.class, () -> {
			patientService.addPatient(requestDTO, "Bearer token");
		});
	}

	@Test
	void testGetAllPatients() {
		Patient patient1 = new Patient();
		patient1.setId(1L);
		patient1.setEmailId("p1@example.com");

		Patient patient2 = new Patient();
		patient2.setId(2L);
		patient2.setEmailId("p2@example.com");

		when(patientRepository.findAll()).thenReturn(Arrays.asList(patient1, patient2));

		List<PatientResponseDTO> result = patientService.getAllPatients();

		assertEquals(2, result.size());
	}

	@Test
	void testGetPatientById_Success() {
		Patient patient = new Patient();
		patient.setId(1L);
		patient.setEmailId("test@example.com");

		when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));

		PatientResponseDTO response = patientService.getPatientById(1L);

		assertEquals("test@example.com", response.getEmailId());
	}

	@Test
	void testGetPatientById_NotFound() {
		when(patientRepository.findById(1L)).thenReturn(Optional.empty());

		assertThrows(PatientNotFoundException.class, () -> {
			patientService.getPatientById(1L);
		});
	}

	@Test
	void testUpdatePatient_Success() {
		PatientRequestDTO requestDTO = new PatientRequestDTO();
		requestDTO.setEmailId("updated@example.com");

		Patient existingPatient = new Patient();
		existingPatient.setId(1L);
		existingPatient.setEmailId("old@example.com");

		UserResponse userResponse = new UserResponse();
		userResponse.setUserRole(UserRole.PATIENT);

		when(patientRepository.findById(1L)).thenReturn(Optional.of(existingPatient));
		when(authClient.getUserByEmail("updated@example.com", "Bearer token")).thenReturn(userResponse);
		when(patientRepository.findByEmailId("updated@example.com")).thenReturn(null);
		when(patientRepository.save(any(Patient.class))).thenReturn(existingPatient);

		PatientResponseDTO response = patientService.updatePatient(requestDTO, 1L, "Bearer token");

		assertEquals("updated@example.com", response.getEmailId());
	}

	@Test
	void testUpdatePatient_ConflictEmail() {
		PatientRequestDTO requestDTO = new PatientRequestDTO();
		requestDTO.setEmailId("conflict@example.com");

		Patient existingPatient = new Patient();
		existingPatient.setId(1L);

		Patient conflictPatient = new Patient();
		conflictPatient.setId(2L);
		conflictPatient.setEmailId("conflict@example.com");

		UserResponse userResponse = new UserResponse();
		userResponse.setUserRole(UserRole.PATIENT);

		when(patientRepository.findById(1L)).thenReturn(Optional.of(existingPatient));
		when(authClient.getUserByEmail("conflict@example.com", "Bearer token")).thenReturn(userResponse);
		when(patientRepository.findByEmailId("conflict@example.com")).thenReturn(conflictPatient);

		assertThrows(IllegalArgumentException.class, () -> {
			patientService.updatePatient(requestDTO, 1L, "Bearer token");
		});
	}

	@Test
	void testGetPatientByEmailId_Success() {
		Patient patient = new Patient();
		patient.setEmailId("patient1@gmail.com");

		when(patientRepository.findByEmailId("patient1@gmail.com")).thenReturn(patient);

		PatientResponseDTO result = patientService.getPatientByemailId("patient1@gmail.com");

		assertNotNull(result);
		assertEquals("patient1@gmail.com", result.getEmailId());
		verify(patientRepository).findByEmailId("patient1@gmail.com");
	}

	@Test
	void testGetPatientByEmailId_NotFound() {
		when(patientRepository.findByEmailId("unknown@gmail.com")).thenReturn(null);
		assertThrows(PatientNotFoundException.class, () -> patientService.getPatientByemailId("unknown@gmail.com"));
	}

}
