package com.cts.mapper;

import com.cts.dto.DoctorRequestDTO;
import com.cts.dto.DoctorResponseDTO;
import com.cts.entity.Doctor;

public class DoctorMapper implements GenericMapper<DoctorResponseDTO, Doctor> {

	public static Doctor toEntity(DoctorRequestDTO dto) {
		Doctor doctor = new Doctor();
		doctor.setSpecialization(dto.getSpecialization());
		doctor.setFee(dto.getFee());
		doctor.setExperience(dto.getExperience());
		doctor.setAvailableDays(dto.getAvailableDays());
		doctor.setLicenseNo(dto.getLicenseNo());
		doctor.setStartTime(dto.getStartTime());
		doctor.setEndTime(dto.getEndTime());
		return doctor;
	}

	public static DoctorResponseDTO toResponseDTO(Doctor doctor) {
		DoctorResponseDTO dto = new DoctorResponseDTO();
		dto.setId(doctor.getId());
		dto.setEmailId(doctor.getEmailId());
		dto.setSpecialization(doctor.getSpecialization());
		dto.setFee(doctor.getFee());
		dto.setExperience(doctor.getExperience());
		dto.setAvailableDays(doctor.getAvailableDays());
		dto.setLicenseNo(doctor.getLicenseNo());
		dto.setStartTime(doctor.getStartTime());
		dto.setEndTime(doctor.getEndTime());
		return dto;
	}

	@Override
	public DoctorResponseDTO toDTO(Doctor doctor) {
		return toResponseDTO(doctor);
	}

	@Override
	public Doctor toEntity(DoctorResponseDTO dto) {
		throw new UnsupportedOperationException("Use toEntity(DoctorRequestDTO) instead.");
	}
}
