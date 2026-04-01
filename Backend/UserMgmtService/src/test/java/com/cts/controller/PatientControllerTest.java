package com.cts.controller;

import com.cts.dto.PatientRequestDTO;
import com.cts.dto.PatientResponseDTO;
import com.cts.service.PatientService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PatientControllerTest {

	@Mock
	private PatientService patientService;

	@InjectMocks
	private PatientController patientController;

	@BeforeEach
	void setUp() {
		MockitoAnnotations.openMocks(this);
	}

	@Test
	void testAddPatient() {
		PatientRequestDTO requestDTO = new PatientRequestDTO();
		PatientResponseDTO responseDTO = new PatientResponseDTO();

		when(patientService.addPatient(requestDTO, "Bearer token")).thenReturn(responseDTO);

		ResponseEntity<PatientResponseDTO> response = patientController.addPatient(requestDTO, "Bearer token");

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(responseDTO, response.getBody());
		verify(patientService).addPatient(requestDTO, "Bearer token");
	}

	@Test
	void testGetAllPatients() {
		List<PatientResponseDTO> patientList = List.of(new PatientResponseDTO(), new PatientResponseDTO());
		when(patientService.getAllPatients()).thenReturn(patientList);

		ResponseEntity<List<PatientResponseDTO>> response = patientController.getAllPatients();

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(patientList, response.getBody());
		verify(patientService).getAllPatients();
	}

	@Test
	void testGetPatientById() {
		PatientResponseDTO patient = new PatientResponseDTO();
		when(patientService.getPatientById(1L)).thenReturn(patient);

		ResponseEntity<PatientResponseDTO> response = patientController.getPatientById(1L);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(patient, response.getBody());
		verify(patientService).getPatientById(1L);
	}

	@Test
	void testUpdatePatient() {
		PatientRequestDTO requestDTO = new PatientRequestDTO();
		PatientResponseDTO updatedPatient = new PatientResponseDTO();

		when(patientService.updatePatient(requestDTO, 1L, "Bearer token")).thenReturn(updatedPatient);

		ResponseEntity<PatientResponseDTO> response = patientController.updatePatient(1L, requestDTO, "Bearer token");

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(updatedPatient, response.getBody());
		verify(patientService).updatePatient(requestDTO, 1L, "Bearer token");
	}

	@Test
	void testGetPatientByEmailId() {
		PatientResponseDTO patient = new PatientResponseDTO();
		when(patientService.getPatientByemailId("patient1@gmail.com")).thenReturn(patient);

		ResponseEntity<PatientResponseDTO> result = patientController.getPatientByemailId("patient1@gmail.com");

		assertEquals(patient, result.getBody());
		verify(patientService).getPatientByemailId("patient1@gmail.com");
	}

}