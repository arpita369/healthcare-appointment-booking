package com.cts.service;

import com.cts.dto.DoctorUnavailabilityRequestDTO;
import com.cts.dto.DoctorUnavailabilityResponseDTO;

import java.time.LocalDate;
import java.util.List;

public interface DoctorUnavailabilityService {

	List<DoctorUnavailabilityResponseDTO> getUnavailabilityByDoctorId(int doctorId);

	DoctorUnavailabilityResponseDTO declareUnavailabilityForNextWeek(int doctorId,
			DoctorUnavailabilityRequestDTO requestDto, String authHeader);

	List<DoctorUnavailabilityResponseDTO> getUnavailabilityByDoctorIdAndDate(int doctorId, LocalDate date);
}
