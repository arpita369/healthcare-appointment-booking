package com.cts.serviceImpl;

import com.cts.client.AuthClient;
import com.cts.dto.*;
import com.cts.entity.Doctor;
import com.cts.exceptions.ResourceNotFoundException;
import com.cts.mapper.DoctorMapper;
import com.cts.repository.DoctorRepository;
import com.cts.serviceimpl.DoctorServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DoctorServiceImplTest {

	@Mock
	private DoctorRepository doctorRepository;

	@Mock
	private AuthClient authClient;

	@InjectMocks
	private DoctorServiceImpl doctorService;

	@BeforeEach
	void setUp() {
		MockitoAnnotations.openMocks(this);
	}

	@Test
	void testSaveDoctor_Success() {
		DoctorRequestDTO requestDTO = new DoctorRequestDTO();
		TokenValidationResponse tokenResponse = new TokenValidationResponse(true, "doctor@example.com",
				UserRole.DOCTOR);

		when(authClient.validateToken("Bearer token")).thenReturn(tokenResponse);
		when(doctorRepository.findByUserEmailId("doctor@example.com")).thenReturn(Optional.empty());

		Doctor doctorEntity = DoctorMapper.toEntity(requestDTO);
		doctorEntity.setEmailId("doctor@example.com");

		when(doctorRepository.save(any(Doctor.class))).thenReturn(doctorEntity);

		DoctorResponseDTO response = doctorService.saveDoctor(requestDTO, "Bearer token");

		assertEquals("doctor@example.com", response.getEmailId());
		verify(doctorRepository).save(any(Doctor.class));
	}

	@Test
	void testSaveDoctor_InvalidToken() {
		TokenValidationResponse tokenResponse = new TokenValidationResponse(false, null, null);
		when(authClient.validateToken("Bearer token")).thenReturn(tokenResponse);

		DoctorRequestDTO requestDTO = new DoctorRequestDTO();

		assertThrows(ResponseStatusException.class, () -> doctorService.saveDoctor(requestDTO, "Bearer token"));
	}

	@Test
	void testSaveDoctor_AlreadyExists() {
		TokenValidationResponse tokenResponse = new TokenValidationResponse(true, "doctor@example.com",
				UserRole.DOCTOR);
		when(authClient.validateToken("Bearer token")).thenReturn(tokenResponse);
		when(doctorRepository.findByUserEmailId("doctor@example.com")).thenReturn(Optional.of(new Doctor()));

		DoctorRequestDTO requestDTO = new DoctorRequestDTO();

		assertThrows(ResponseStatusException.class, () -> doctorService.saveDoctor(requestDTO, "Bearer token"));
	}

	@Test
	void testGetDoctorByEmailId_Success() {
		Doctor doctor = new Doctor();
		doctor.setId(1);
		doctor.setEmailId("doctor@example.com");

		when(doctorRepository.findById(1)).thenReturn(Optional.of(doctor));

		DoctorResponseDTO response = doctorService.getDoctorByEmailId("1");

		assertEquals("doctor@example.com", response.getEmailId());
	}

	@Test
	void testGetDoctorByEmailId_NotFound() {
		when(doctorRepository.findById(99)).thenReturn(Optional.empty());

		assertThrows(ResourceNotFoundException.class, () -> doctorService.getDoctorByEmailId("99"));
	}

	@Test
	void testGetDoctorsBySpecialization_Found() {
		Doctor doctor = new Doctor();
		doctor.setSpecialization("Cardiology");

		when(doctorRepository.findBySpecialization("Cardiology")).thenReturn(List.of(doctor));

		List<DoctorResponseDTO> result = doctorService.getDoctorsBySpecialization("Cardiology");

		assertEquals(1, result.size());
	}

	@Test
	void testGetDoctorsBySpecialization_NotFound() {
		when(doctorRepository.findBySpecialization("Neurology")).thenReturn(List.of());

		assertThrows(ResourceNotFoundException.class, () -> doctorService.getDoctorsBySpecialization("Neurology"));
	}

	@Test
	void testGetDoctorByLicenseNo_Found() {
		Doctor doctor = new Doctor();
		doctor.setLicenseNo("LIC123");

		when(doctorRepository.findByLicenseNo("LIC123")).thenReturn(doctor);

		DoctorResponseDTO result = doctorService.getDoctorByLicenseNo("LIC123");

		assertEquals("LIC123", result.getLicenseNo());
	}

	@Test
	void testGetDoctorByLicenseNo_NotFound() {
		when(doctorRepository.findByLicenseNo("LIC999")).thenReturn(null);

		assertThrows(ResourceNotFoundException.class, () -> doctorService.getDoctorByLicenseNo("LIC999"));
	}

	@Test
	void testUpdateDoctor_Success() {
		String doctorId = "1";
		DoctorRequestDTO requestDTO = new DoctorRequestDTO();
		requestDTO.setSpecialization("Cardiology");
		requestDTO.setFee(500);
		requestDTO.setExperience("10 Years");
		requestDTO.setAvailableDays("Monday, Wednesday");
		requestDTO.setLicenseNo("LIC123");
		requestDTO.setStartTime("09:00");
		requestDTO.setEndTime("17:00");

		TokenValidationResponse tokenResponse = new TokenValidationResponse(true, "doc1@gmail.com", UserRole.DOCTOR);
		Doctor existingDoctor = new Doctor();
		existingDoctor.setId(1);

		when(authClient.validateToken("Bearer token")).thenReturn(tokenResponse);
		when(doctorRepository.findById(1)).thenReturn(Optional.of(existingDoctor));
		when(doctorRepository.save(any(Doctor.class))).thenReturn(existingDoctor);

		DoctorResponseDTO result = doctorService.updateDoctor(doctorId, requestDTO, "Bearer token");

		assertNotNull(result);
		verify(doctorRepository).save(existingDoctor);
	}

	@Test
	void testUpdateDoctor_InvalidToken() {
		TokenValidationResponse tokenResponse = new TokenValidationResponse(false, "doc1@gmail.com", UserRole.DOCTOR);
		when(authClient.validateToken("Bearer token")).thenReturn(tokenResponse);

		DoctorRequestDTO requestDTO = new DoctorRequestDTO();

		assertThrows(ResponseStatusException.class, () -> doctorService.updateDoctor("1", requestDTO, "Bearer token"));
	}

	@Test
	void testGetAllDoctors() {
		Doctor doctor1 = new Doctor();
		Doctor doctor2 = new Doctor();
		when(doctorRepository.findAll()).thenReturn(List.of(doctor1, doctor2));

		List<DoctorResponseDTO> result = doctorService.getAllDoctors();

		assertEquals(2, result.size());
		verify(doctorRepository).findAll();
	}

	@Test
	void testGetDoctorsByAvailableDay_Success() {
		Doctor doctor = new Doctor();
		doctor.setAvailableDays("Monday");
		when(doctorRepository.findByAvailableDay("Monday")).thenReturn(List.of(doctor));

		List<DoctorResponseDTO> result = doctorService.getDoctorsByAvailableDay("Monday");

		assertEquals(1, result.size());
		verify(doctorRepository).findByAvailableDay("Monday");
	}

	@Test
	void testGetDoctorsByAvailableDay_NotFound() {
		when(doctorRepository.findByAvailableDay("Sunday")).thenReturn(null);
	}

	@Test
	void testGetDoctorByEmail_Success() {
		Doctor doctor = new Doctor();
		doctor.setEmailId("doc1@gmail.com");
		when(doctorRepository.findByEmailId("doc1@gmail.com")).thenReturn(Optional.of(doctor));

		DoctorResponseDTO result = doctorService.getDoctorByEmail("doc1@gmail.com");

		assertNotNull(result);
		verify(doctorRepository).findByEmailId("doc1@gmail.com");
	}

	@Test
	void testGetDoctorByEmail_NotFound() {
		when(doctorRepository.findByEmailId("unknown@gmail.com")).thenReturn(Optional.empty());

		assertThrows(ResourceNotFoundException.class, () -> doctorService.getDoctorByEmail("unknown@gmail.com"));
	}

}