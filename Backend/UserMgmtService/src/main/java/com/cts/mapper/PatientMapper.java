package com.cts.mapper;

import com.cts.dto.PatientRequestDTO;
import com.cts.dto.PatientResponseDTO;
import com.cts.entity.Patient;

public class PatientMapper implements GenericMapper<PatientResponseDTO, Patient> {

	public static Patient toEntity(PatientRequestDTO dto) {
		Patient patient = new Patient();
		patient.setEmailId(dto.getEmailId());
		patient.setBloodType(dto.getBloodType());
		patient.setEmergencyContact(dto.getEmergencyContact());
		patient.setMedicalHistory(dto.getMedicalHistory());
		patient.setAllergies(dto.getAllergies());
		patient.setHomeAddress(dto.getHomeAddress());
		return patient;
	}

	public static PatientResponseDTO toResponseDTO(Patient patient) {
		PatientResponseDTO dto = new PatientResponseDTO();
		dto.setId(patient.getId());
		dto.setEmailId(patient.getEmailId());
		dto.setBloodType(patient.getBloodType());
		dto.setEmergencyContact(patient.getEmergencyContact());
		dto.setMedicalHistory(patient.getMedicalHistory());
		dto.setAllergies(patient.getAllergies());
		dto.setHomeAddress(patient.getHomeAddress());
		dto.setCreatedAt(patient.getCreatedAt());
		return dto;
	}

	@Override
	public PatientResponseDTO toDTO(Patient entity) {
		return toResponseDTO(entity);
	}

	@Override
	public Patient toEntity(PatientResponseDTO dto) {
		throw new UnsupportedOperationException("Use toEntity(PatientRequestDTO) instead.");
	}
}
