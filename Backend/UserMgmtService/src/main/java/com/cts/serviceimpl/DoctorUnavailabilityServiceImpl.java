package com.cts.serviceimpl;

import com.cts.client.AppointmentClient;
import com.cts.dto.CancelDTO;
import com.cts.dto.DoctorUnavailabilityRequestDTO;
import com.cts.dto.DoctorUnavailabilityResponseDTO;
import com.cts.entity.Doctor;
import com.cts.entity.DoctorUnavailability;
import com.cts.exceptions.ResourceNotFoundException;
import com.cts.mapper.DoctorUnavailabilityMapper;
import com.cts.repository.DoctorRepository;
import com.cts.repository.DoctorUnavailabilityRepository;
import com.cts.service.DoctorUnavailabilityService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DoctorUnavailabilityServiceImpl implements DoctorUnavailabilityService {

	private static final Logger logger = LoggerFactory.getLogger(DoctorUnavailabilityServiceImpl.class);

	private final DoctorRepository doctorRepository;
	private final DoctorUnavailabilityRepository unavailabilityRepo;
	private final DoctorUnavailabilityMapper mapper;
	private final AppointmentClient appointmentClient;

	public DoctorUnavailabilityServiceImpl(DoctorRepository doctorRepository,
			DoctorUnavailabilityRepository unavailabilityRepo, AppointmentClient appointmentClient,
			DoctorUnavailabilityMapper mapper) {
		this.doctorRepository = doctorRepository;
		this.unavailabilityRepo = unavailabilityRepo;
		this.appointmentClient = appointmentClient;
		this.mapper = mapper;
	}

	@Override
	@Transactional
	public DoctorUnavailabilityResponseDTO declareUnavailabilityForNextWeek(int doctorId,
			DoctorUnavailabilityRequestDTO requestDto, String authHeader) {

		logger.info("Declaring unavailability for doctor with ID: {}", doctorId);

		Doctor doctor = doctorRepository.findById((long) doctorId).orElseThrow(() -> {
			logger.error("Doctor not found with ID: {}", doctorId);
			return new ResourceNotFoundException("Doctor not found with ID: " + doctorId);
		});

		LocalDate today = LocalDate.now();
		LocalDate nextWeekStart = today.plusWeeks(1).with(java.time.DayOfWeek.MONDAY);
		LocalDate nextWeekEnd = nextWeekStart.plusDays(6);

		if (requestDto.getDate().isBefore(nextWeekStart) || requestDto.getDate().isAfter(nextWeekEnd)) {
			logger.warn("Unavailability date {} is outside next week's range", requestDto.getDate());
			throw new IllegalArgumentException("Unavailability must be within next week's range.");
		}

		DoctorUnavailability entity = DoctorUnavailabilityMapper.toEntity(requestDto, doctor);
		DoctorUnavailability savedEntity = null;
		try {
			savedEntity = unavailabilityRepo.save(entity);
			logger.info("Unavailability saved. Now calling AppointmentService to cancel appointments.");

			String dateString = requestDto.getDate().format(DateTimeFormatter.ISO_LOCAL_DATE); // e.g., "2025-11-17"

			DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
			LocalDate localDate = LocalDate.parse(dateString, formatter);

			logger.debug("Calling AppointmentClient with date string: {}", dateString);
			CancelDTO cancelDTO = new CancelDTO();
			cancelDTO.setDoctorId(doctorId);
			cancelDTO.setAppointmentDate(localDate);
			appointmentClient.cancelAppointmentbyDoctorUnavail(cancelDTO, authHeader);
			logger.info("Successfully called AppointmentService.");

		} catch (Exception e) {
			logger.error("Error calling AppointmentService. Rolling back transaction.", e);
			throw new RuntimeException("Failed to cancel appointments: " + e.getMessage(), e);
		}
		logger.info("Unavailability saved and appointments cancelled for doctor ID: {}", doctorId);

		return mapper.toDTO(savedEntity);
	}

	@Override
	public List<DoctorUnavailabilityResponseDTO> getUnavailabilityByDoctorId(int doctorId) {
		logger.info("Fetching unavailability for doctor with ID: {}", doctorId);
		List<DoctorUnavailability> entities = unavailabilityRepo.findByDoctor_Id((long) doctorId);
		return entities.stream().map(mapper::toDTO).collect(Collectors.toList());
	}

	@Override
	public List<DoctorUnavailabilityResponseDTO> getUnavailabilityByDoctorIdAndDate(int doctorId, LocalDate date) {
		logger.info("Fetching unavailability for doctor with ID: {} on date: {}", doctorId, date);

		List<DoctorUnavailability> entities = unavailabilityRepo.findByDoctorIdAndDate(doctorId, date);

		if (entities.isEmpty()) {
			logger.info("No unavailability found for doctor {} on {}.", doctorId, date);
			return List.of();
		}

		logger.info("Found {} unavailability records for doctor {} on {}.", entities.size(), doctorId, date);
		return entities.stream().map(mapper::toDTO).collect(Collectors.toList());
	}
}