package com.cts.service;

import com.cts.dto.PatientRequestDTO;
import com.cts.dto.PatientResponseDTO;

import java.util.List;

public interface PatientService {
	List<PatientResponseDTO> getAllPatients();

	PatientResponseDTO getPatientById(long id);

	PatientResponseDTO updatePatient(PatientRequestDTO patientDTO, long id, String authHeader);

	PatientResponseDTO addPatient(PatientRequestDTO patientDTO, String authHeader);

	PatientResponseDTO getPatientByemailId(String emailId);
}
