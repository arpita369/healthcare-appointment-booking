package com.cts.serviceImpl;

import com.cts.dto.DoctorUnavailabilityRequestDTO;
import com.cts.entity.Doctor;
import com.cts.entity.DoctorUnavailability;
import com.cts.exceptions.ResourceNotFoundException;
import com.cts.repository.DoctorRepository;
import com.cts.repository.DoctorUnavailabilityRepository;
import com.cts.serviceimpl.DoctorUnavailabilityServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DoctorUnavailabilityServiceImplTest {

	@Mock
	private DoctorRepository doctorRepository;

	@Mock
	private DoctorUnavailabilityRepository unavailabilityRepo;

	private String authHeader = "authheader";

	@InjectMocks
	private DoctorUnavailabilityServiceImpl service;

	private Doctor doctor;

	@BeforeEach
	void setUp() {
		MockitoAnnotations.openMocks(this);
		doctor = new Doctor();
		doctor.setId(1);
	}

	@Test
	void testDeclareUnavailabilityForNextWeek_Success() {
		LocalDate nextMonday = LocalDate.now().plusWeeks(1).with(java.time.DayOfWeek.MONDAY);
		DoctorUnavailabilityRequestDTO requestDTO = new DoctorUnavailabilityRequestDTO();
		requestDTO.setDate(nextMonday);

		DoctorUnavailability entity = new DoctorUnavailability();
		entity.setId(1L);
		entity.setDate(nextMonday);
		entity.setDoctor(doctor);

		when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));
		when(unavailabilityRepo.save(any(DoctorUnavailability.class))).thenReturn(entity);

	}

	@Test
	void testDeclareUnavailabilityForNextWeek_DoctorNotFound() {
		DoctorUnavailabilityRequestDTO requestDTO = new DoctorUnavailabilityRequestDTO();
		requestDTO.setDate(LocalDate.now().plusWeeks(1).with(java.time.DayOfWeek.MONDAY));

		when(doctorRepository.findById(1L)).thenReturn(Optional.empty());

		assertThrows(ResourceNotFoundException.class, () -> {
			service.declareUnavailabilityForNextWeek(1, requestDTO, authHeader);
		});
	}

	@Test
	void testDeclareUnavailabilityForNextWeek_InvalidDate() {
		DoctorUnavailabilityRequestDTO requestDTO = new DoctorUnavailabilityRequestDTO();
		requestDTO.setDate(LocalDate.now()); // Not in next week

		when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));

		assertThrows(IllegalArgumentException.class, () -> {
			service.declareUnavailabilityForNextWeek(1, requestDTO, authHeader);
		});
	}

	@Test
	void testGetUnavailabilityByDoctorId() {
		DoctorUnavailability unavailability1 = new DoctorUnavailability();
		unavailability1.setId(1L);
		unavailability1.setDate(LocalDate.now().plusWeeks(1).with(java.time.DayOfWeek.MONDAY));
		unavailability1.setDoctor(doctor);

		DoctorUnavailability unavailability2 = new DoctorUnavailability();
		unavailability2.setId(2L);
		unavailability2.setDate(LocalDate.now().plusWeeks(1).with(java.time.DayOfWeek.TUESDAY));
		unavailability2.setDoctor(doctor);

		when(unavailabilityRepo.findByDoctor_Id(1L)).thenReturn(Arrays.asList(unavailability1, unavailability2));

	}
}