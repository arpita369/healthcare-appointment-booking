package com.cts.controller;

import com.cts.dto.DoctorUnavailabilityRequestDTO;
import com.cts.dto.DoctorUnavailabilityResponseDTO;
import com.cts.service.DoctorUnavailabilityService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DoctorUnavailabilityControllerTest {

	@InjectMocks
	private DoctorUnavailabilityController controller;

	@Mock
	private DoctorUnavailabilityService service;

	private String authHeader = "authHeader";

	@BeforeEach
	void setUp() {
		MockitoAnnotations.openMocks(this);
	}

	@Test
	void testDeclareUnavailability() {
		int doctorId = 1;
		DoctorUnavailabilityRequestDTO requestDTO = new DoctorUnavailabilityRequestDTO();
		requestDTO.setDate(LocalDate.now().plusWeeks(1).with(java.time.DayOfWeek.MONDAY));

		DoctorUnavailabilityResponseDTO responseDTO = new DoctorUnavailabilityResponseDTO();
		responseDTO.setDate(requestDTO.getDate());

		when(service.declareUnavailabilityForNextWeek(doctorId, requestDTO, authHeader)).thenReturn(responseDTO);

		ResponseEntity<DoctorUnavailabilityResponseDTO> response = controller.declareUnavailability(doctorId,
				requestDTO, authHeader);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(requestDTO.getDate(), response.getBody().getDate());
		verify(service).declareUnavailabilityForNextWeek(doctorId, requestDTO, authHeader);
	}

	@Test
	void testGetUnavailability() {
		int doctorId = 1;
		DoctorUnavailabilityResponseDTO dto1 = new DoctorUnavailabilityResponseDTO();
		dto1.setDate(LocalDate.now().plusWeeks(1).with(java.time.DayOfWeek.MONDAY));

		DoctorUnavailabilityResponseDTO dto2 = new DoctorUnavailabilityResponseDTO();
		dto2.setDate(LocalDate.now().plusWeeks(1).with(java.time.DayOfWeek.TUESDAY));

		List<DoctorUnavailabilityResponseDTO> mockList = Arrays.asList(dto1, dto2);

		when(service.getUnavailabilityByDoctorId(doctorId)).thenReturn(mockList);

		ResponseEntity<List<DoctorUnavailabilityResponseDTO>> response = controller.getUnavailability(doctorId);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(2, response.getBody().size());
		verify(service).getUnavailabilityByDoctorId(doctorId);
	}
}
