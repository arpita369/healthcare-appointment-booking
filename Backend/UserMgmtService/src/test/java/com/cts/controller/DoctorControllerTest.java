package com.cts.controller;

import com.cts.dto.DoctorRequestDTO;
import com.cts.dto.DoctorResponseDTO;
import com.cts.service.DoctorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DoctorControllerTest {

	@Mock
	private DoctorService doctorService;

	@InjectMocks
	private DoctorController doctorController;

	@BeforeEach
	void setUp() {
		MockitoAnnotations.openMocks(this);
	}

	@Test
	void testCreateDoctor() {
		DoctorRequestDTO request = new DoctorRequestDTO();
		DoctorResponseDTO response = new DoctorResponseDTO();
		when(doctorService.saveDoctor(eq(request), anyString())).thenReturn(response);

		ResponseEntity<DoctorResponseDTO> result = doctorController.createDoctor(request, "Bearer token");

		assertEquals(response, result.getBody());
		verify(doctorService).saveDoctor(request, "Bearer token");
	}

	@Test
	void testGetAllDoctors() {
		List<DoctorResponseDTO> doctors = List.of(new DoctorResponseDTO(), new DoctorResponseDTO());
		when(doctorService.getAllDoctors()).thenReturn(doctors);

		ResponseEntity<List<DoctorResponseDTO>> result = doctorController.getAllDoctors();

		assertEquals(doctors, result.getBody());
		verify(doctorService).getAllDoctors();
	}

	@Test
	void testGetDoctorById() {
		DoctorResponseDTO doctor = new DoctorResponseDTO();
		when(doctorService.getDoctorByEmailId("doc123")).thenReturn(doctor);

		ResponseEntity<DoctorResponseDTO> result = doctorController.getDoctorById("doc123");

		assertEquals(doctor, result.getBody());
		verify(doctorService).getDoctorByEmailId("doc123");
	}

	@Test
	void testUpdateDoctor() {
		DoctorRequestDTO request = new DoctorRequestDTO();
		DoctorResponseDTO updatedDoctor = new DoctorResponseDTO();
		when(doctorService.updateDoctor(eq("doc123"), eq(request), anyString())).thenReturn(updatedDoctor);

		ResponseEntity<DoctorResponseDTO> result = doctorController.updateDoctor("doc123", request, "Bearer token");

		assertEquals(updatedDoctor, result.getBody());
		verify(doctorService).updateDoctor("doc123", request, "Bearer token");
	}

	@Test
	void testGetDoctorsBySpecialization() {
		List<DoctorResponseDTO> doctors = List.of(new DoctorResponseDTO());
		when(doctorService.getDoctorsBySpecialization("Cardiology")).thenReturn(doctors);

		ResponseEntity<List<DoctorResponseDTO>> result = doctorController.getDoctorsBySpecialization("Cardiology");

		assertEquals(doctors, result.getBody());
		verify(doctorService).getDoctorsBySpecialization("Cardiology");
	}

	@Test
	void testGetDoctorsByAvailableDay() {
		List<DoctorResponseDTO> doctors = List.of(new DoctorResponseDTO());
		when(doctorService.getDoctorsByAvailableDay("Monday")).thenReturn(doctors);

		ResponseEntity<List<DoctorResponseDTO>> result = doctorController.getDoctorsByAvailableDay("Monday");

		assertEquals(doctors, result.getBody());
		verify(doctorService).getDoctorsByAvailableDay("Monday");
	}

	@Test
	void testGetDoctorByLicenseNo() {
		DoctorResponseDTO doctor = new DoctorResponseDTO();
		when(doctorService.getDoctorByLicenseNo("LIC123")).thenReturn(doctor);

		ResponseEntity<DoctorResponseDTO> result = doctorController.getDoctorByLicenseNo("LIC123");

		assertEquals(doctor, result.getBody());
		verify(doctorService).getDoctorByLicenseNo("LIC123");
	}

	@Test
	void testGetDoctorByEmail() {
		DoctorResponseDTO doctor = new DoctorResponseDTO();
		when(doctorService.getDoctorByEmail("doc1@gmail.com")).thenReturn(doctor);

		ResponseEntity<DoctorResponseDTO> result = doctorController.getDoctorByEmail("doc1@gmail.com");

		assertEquals(doctor, result.getBody());
		verify(doctorService).getDoctorByEmail("doc1@gmail.com");
	}

}