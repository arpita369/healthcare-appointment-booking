package com.cts.mapper;

import com.cts.dto.DoctorUnavailabilityRequestDTO;
import com.cts.dto.DoctorUnavailabilityResponseDTO;
import com.cts.entity.Doctor;
import com.cts.entity.DoctorUnavailability;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DoctorUnavailabilityMapper
		implements GenericMapper<DoctorUnavailabilityResponseDTO, DoctorUnavailability> {

	public static DoctorUnavailability toEntity(DoctorUnavailabilityRequestDTO dto, Doctor doctor) {
		DoctorUnavailability entity = new DoctorUnavailability();
		entity.setDate(dto.getDate());
		entity.setReason(dto.getReason());
		entity.setDoctor(doctor);
		entity.setCreatedAt(LocalDateTime.now());
		return entity;
	}

	public static DoctorUnavailabilityResponseDTO toResponseDTO(DoctorUnavailability entity) {
		DoctorUnavailabilityResponseDTO dto = new DoctorUnavailabilityResponseDTO();
		dto.setId(entity.getId());
		dto.setDate(entity.getDate());
		dto.setReason(entity.getReason());
		dto.setDoctorId(entity.getDoctor().getId());
		dto.setCreatedAt(entity.getCreatedAt());
		return dto;
	}

	@Override
	public DoctorUnavailabilityResponseDTO toDTO(DoctorUnavailability entity) {
		return toResponseDTO(entity);
	}

	@Override
	public DoctorUnavailability toEntity(DoctorUnavailabilityResponseDTO dto) {
		throw new UnsupportedOperationException("Use toEntity(DoctorUnavailabilityRequestDTO, Doctor) instead.");
	}
}
