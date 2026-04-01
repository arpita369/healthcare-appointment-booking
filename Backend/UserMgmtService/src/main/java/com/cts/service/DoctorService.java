package com.cts.service;

import com.cts.dto.DoctorRequestDTO;
import com.cts.dto.DoctorResponseDTO;

import java.util.List;

public interface DoctorService {
	DoctorResponseDTO saveDoctor(DoctorRequestDTO doctorDTO, String authHeader);

	DoctorResponseDTO updateDoctor(String doctorId, DoctorRequestDTO updatedDoctorDTO, String authHeader);

	List<DoctorResponseDTO> getAllDoctors();

	DoctorResponseDTO getDoctorByEmailId(String emailId);

	List<DoctorResponseDTO> getDoctorsBySpecialization(String specialization);

	List<DoctorResponseDTO> getDoctorsByAvailableDay(String day);

	DoctorResponseDTO getDoctorByLicenseNo(String licenseNo);

	DoctorResponseDTO getDoctorByEmail(String emailId);
}