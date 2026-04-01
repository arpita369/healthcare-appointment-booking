package com.cts.service.impl;

import com.cts.client.AuthClient;
import com.cts.client.UserClient;
import com.cts.dto.*;
import com.cts.entity.Appointment;
import com.cts.mapper.AppointmentMapper;
import com.cts.repository.AppointmentRepository;
import com.cts.service.AppointmentService;

import feign.FeignException;
import jakarta.transaction.Transactional;

import java.util.*;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AppointmentServiceImpl implements AppointmentService {

    private static final Logger log = LoggerFactory.getLogger(AppointmentServiceImpl.class);

    private final AppointmentMapper appointmentMapper;
    private final AppointmentRepository appointmentRepository;
    private final AuthClient authClient;
    private final UserClient userClient;

    public AppointmentServiceImpl(AppointmentRepository appointmentRepository, UserClient userClient, AuthClient authClient, AppointmentMapper appointmentMapper) {
        this.appointmentRepository = appointmentRepository;
        this.authClient = authClient;
        this.userClient = userClient;
        this.appointmentMapper = appointmentMapper;
    }

    @Override
    public AppointmentDTO bookAppointment(AppointmentDTO dto, String authHeader) {
        log.info("Attempting to book appointment for patientId: {} with doctorId: {}", dto.getPatientId(), dto.getDoctorId());
        log.debug("Incoming AppointmentDTO: {}", dto);

        TokenValidationResponse authClientResponse = authClient.validateToken(authHeader);

        if (!authClientResponse.isValid()) {
            log.warn("Booking failed: Invalid token provided.");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");
        }

        if (!authClientResponse.getUserRole().equals(UserRole.PATIENT)) {
            log.warn("Booking failed: Access denied for user role: {}", authClientResponse.getUserRole());
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        DoctorResponseDTO doctorUser = userClient.getDoctorById(dto.getDoctorId(), authHeader);
        PatientResponseDTO patientUser = userClient.getPatientById(dto.getPatientId(), authHeader);

        if (doctorUser == null || patientUser == null) {
            log.warn("Booking failed: Doctor (ID: {}) or Patient (ID: {}) user not found.", dto.getDoctorId(), dto.getPatientId());
            throw new IllegalArgumentException("Doctor or Patient user not found.");
        }

        String requestedDay = dto.getAppointmentDate().getDayOfWeek().name();
        String availableDays = doctorUser.getAvailableDays();
        log.debug("Checking availability. Doctor available: [{}], Requested: {}", availableDays, requestedDay);

        boolean isAvailable = Arrays.stream(availableDays.split(","))
                .map(String::trim)
                .map(String::toUpperCase)
                .anyMatch(day -> day.equals(requestedDay));

        if (!isAvailable) {
            log.warn("Booking failed: Doctor (ID: {}) is not available on {}", dto.getDoctorId(), requestedDay);
            throw new IllegalArgumentException("Doctor is not available on " + requestedDay);
        }

        log.info("Checking specific unavailability for doctor {} on {}", dto.getDoctorId(), dto.getAppointmentDate());
        try {
            ResponseEntity<List<DoctorUnavailabilityResponseDTO>> unavailabilityResponse = userClient.getUnavailabilityByDate(dto.getDoctorId(), dto.getAppointmentDate(), authHeader);

            if (unavailabilityResponse.getStatusCode().is2xxSuccessful() &&
                unavailabilityResponse.getBody() != null &&
                !unavailabilityResponse.getBody().isEmpty()) {

                log.warn("Booking failed: Doctor (ID: {}) has declared unavailability for {}", dto.getDoctorId(), dto.getAppointmentDate());
                throw new IllegalArgumentException("Doctor is unavailable on " + dto.getAppointmentDate());
            }
            
            log.info("Doctor is available (no specific unavailability found).");

        } catch (FeignException.NotFound e) {
            log.info("Doctor is available (Feign 404: No unavailability record found).");
            
        } catch (FeignException e) {
            log.error("Error checking doctor unavailability via Feign for doctor ID: {}", dto.getDoctorId(), e);
            throw new RuntimeException("Could not verify doctor availability. Please try again.");
        }
        
        Appointment appointment = new Appointment();
        appointment.setAppointmentDate(dto.getAppointmentDate());
        appointment.setTimeSlot(dto.getTimeSlot());
        appointment.setAppointmentType(dto.getAppointmentType());
        appointment.setSymptoms(dto.getSymptoms());
        appointment.setAdditionalNotes(dto.getAdditionalNotes());
        appointment.setDoctorId(dto.getDoctorId());
        appointment.setPatientId(dto.getPatientId());
        appointment.setStatus("Confirmed");

        Appointment saved = appointmentRepository.save(appointment);
        log.info("Successfully booked appointment with ID: {}", saved.getId());

        AppointmentDTO response = new AppointmentDTO();
        response.setId(saved.getId());
        response.setAppointmentDate(saved.getAppointmentDate());
        response.setTimeSlot(saved.getTimeSlot());
        response.setAppointmentType(saved.getAppointmentType());
        response.setSymptoms(saved.getSymptoms());
        response.setAdditionalNotes(saved.getAdditionalNotes());
        response.setDoctorId(saved.getDoctorId());
        response.setPatientId(saved.getPatientId());
        response.setStatus(saved.getStatus());
        return response;
    }

    @Override
    public Appointment getAppointmentById(long id, String authHeader) {
        log.info("Attempting to get appointment by ID: {}", id);

        TokenValidationResponse authClientResponse = authClient.validateToken(authHeader);

        if (!authClientResponse.isValid()) {
            log.warn("Get appointment failed: Invalid token provided.");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");
        }

        Appointment appointment = appointmentRepository.findById(id).orElseThrow(() -> {
            log.warn("Appointment not found with ID: {}", id);
            return new RuntimeException("Appointment not found with ID: " + id);
        });

        DoctorResponseDTO doctorUser = userClient.getDoctorById(appointment.getDoctorId(), authHeader);
        PatientResponseDTO patientUser = userClient.getPatientById(appointment.getPatientId(), authHeader);

        if (!authClientResponse.getEmailId().equals(doctorUser.getEmailId()) && !authClientResponse.getEmailId().equals(patientUser.getEmailId())) {
            log.warn("Access denied for user {} to view appointment ID: {}", authClientResponse.getEmailId(), id);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        
        log.info("Successfully retrieved appointment with ID: {}", id);
        return appointment;
    }

    @Override
    public Appointment updateAppointment(long id, Appointment updatedAppointment, String authHeader) {
        log.info("Attempting to update appointment with ID: {}", id);
        log.debug("Update data: {}", updatedAppointment);

        TokenValidationResponse authClientResponse = authClient.validateToken(authHeader);

        if (!authClientResponse.isValid()) {
            log.warn("Update appointment failed: Invalid token provided.");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");
        }

        Appointment existing = appointmentRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Cannot update. Appointment not found with ID: {}", id);
                    return new RuntimeException("Appointment not found with ID: " + id);
                });

        existing.setAppointmentDate(updatedAppointment.getAppointmentDate());
        existing.setTimeSlot(updatedAppointment.getTimeSlot());
        existing.setAppointmentType(updatedAppointment.getAppointmentType());
        existing.setSymptoms(updatedAppointment.getSymptoms());
        existing.setAdditionalNotes(updatedAppointment.getAdditionalNotes());

        Appointment saved = appointmentRepository.save(existing);
        log.info("Successfully updated appointment with ID: {}", id);
        return saved;
    }

    @Override
    public List<AppointmentResponseDTO> getAllAppointments(String authHeader) {
        log.info("Attempting to get all appointments");
        TokenValidationResponse authClientResponse = authClient.validateToken(authHeader);

        if (!authClientResponse.isValid()) {
            log.warn("Get all appointments failed: Invalid token provided.");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");
        }

        List<Appointment> appointments = appointmentRepository.findAll();
        log.info("Found {} appointments. Mapping to DTOs.", appointments.size());

        return appointments.stream()
                .map(appointment -> {
                    AppointmentResponseDTO dto = appointmentMapper.toResponseDTO(appointment);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public void deleteAppointmentById(long id, String authHeader) {
        log.info("Attempting to delete appointment with ID: {}", id);
        TokenValidationResponse authClientResponse = authClient.validateToken(authHeader);

        if (!authClientResponse.isValid()) {
            log.warn("Delete appointment failed: Invalid token provided.");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");
        }

        Appointment appointment = appointmentRepository.findById(id).orElseThrow(() -> {
            log.warn("Cannot delete. Appointment not found with ID: {}", id);
            return new IllegalArgumentException("Appointment not found with ID: " + id);
        });

        appointmentRepository.delete(appointment);
        log.info("Successfully deleted appointment with ID: {}", id);
    }
    
    private AppointmentDTO mapToDTO(Appointment entity) {
        AppointmentDTO dto = new AppointmentDTO();
        dto.setId(entity.getId());
        dto.setDoctorId(entity.getDoctorId());
        dto.setPatientId(entity.getPatientId());
        dto.setAppointmentDate(entity.getAppointmentDate());
        dto.setTimeSlot(entity.getTimeSlot());
        dto.setSymptoms(entity.getSymptoms());
        dto.setAppointmentType(entity.getAppointmentType());
        dto.setAdditionalNotes(entity.getAdditionalNotes());
        dto.setStatus(entity.getStatus());
        return dto;
    }

	@Override
	public AppointmentDTO cancelAppointment(Long appointmentId, String authHeader) {
		log.info("Attempting to cancel appointment by id");
        TokenValidationResponse authClientResponse = authClient.validateToken(authHeader);

        if (!authClientResponse.isValid()) {
            log.warn("Attempting to cancel appointment failed: Invalid token provided.");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");
        }
        Appointment appointment = appointmentRepository.findById(appointmentId).orElseThrow(() -> {
            log.warn("Cannot delete. Appointment not found with ID: {}", appointmentId);
            return new IllegalArgumentException("Appointment not found with ID: " + appointmentId);
        });

        appointment.setStatus("Cancelled");
        appointmentRepository.save(appointment);
        log.info("Successfully canceled appointment with ID: {}", appointmentId);
		return mapToDTO(appointment);
	}

	@Override
    @Transactional
    public boolean cancelAppointmentbyDoctorUnavail(CancelDTO cancelDTO) {
        int updatedCount = appointmentRepository.cancelAppointmentsByDoctorAndDate(cancelDTO.getDoctorId(), cancelDTO.getAppointmentDate());
        log.info("Cancelled {} appointments for unavailable doctor {}.", updatedCount, cancelDTO.getDoctorId());
        return updatedCount>0;
	}

}