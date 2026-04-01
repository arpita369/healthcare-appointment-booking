package com.cts.serviceImpl;

import com.cts.client.AuthClient;
import com.cts.client.UserClient;
import com.cts.dto.*;
import com.cts.entity.Appointment;
import com.cts.mapper.AppointmentMapper;
import com.cts.repository.AppointmentRepository;
import com.cts.service.impl.AppointmentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AppointmentServiceImplTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private AuthClient authClient;

    @Mock
    private UserClient userClient;

    @Mock
    private AppointmentMapper appointmentMapper;

    @InjectMocks
    private AppointmentServiceImpl appointmentService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testBookAppointment_Success() {
        AppointmentDTO dto = new AppointmentDTO();
        dto.setDoctorId(1);
        dto.setPatientId(2L);
        dto.setAppointmentDate(LocalDate.of(2025, 11, 10));

        TokenValidationResponse token = new TokenValidationResponse(true, "patient@example.com", UserRole.PATIENT);
        DoctorResponseDTO doctor = new DoctorResponseDTO();
        doctor.setAvailableDays("MONDAY,TUESDAY");
        PatientResponseDTO patient = new PatientResponseDTO();

        when(authClient.validateToken(anyString())).thenReturn(token);
        when(userClient.getDoctorById(1, "Bearer token")).thenReturn(doctor);
        when(userClient.getPatientById(2L, "Bearer token")).thenReturn(patient);
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(i -> {
            Appointment a = i.getArgument(0);
            a.setId(100L);
            return a;
        });
    }

    @Test
    void testBookAppointment_InvalidToken() {
        TokenValidationResponse token = new TokenValidationResponse(false, null, null);
        when(authClient.validateToken(anyString())).thenReturn(token);

        AppointmentDTO dto = new AppointmentDTO();
        assertThrows(ResponseStatusException.class, () -> appointmentService.bookAppointment(dto, "Bearer token"));
    }

    @Test
    void testBookAppointment_AccessDenied() {
        TokenValidationResponse token = new TokenValidationResponse(true, "user@example.com", UserRole.DOCTOR);
        when(authClient.validateToken(anyString())).thenReturn(token);

        AppointmentDTO dto = new AppointmentDTO();
        assertThrows(ResponseStatusException.class, () -> appointmentService.bookAppointment(dto, "Bearer token"));
    }

    @Test
    void testBookAppointment_DoctorOrPatientNull() {
        TokenValidationResponse token = new TokenValidationResponse(true, "user@example.com", UserRole.PATIENT);
        when(authClient.validateToken(anyString())).thenReturn(token);
        when(userClient.getDoctorById(anyInt(), anyString())).thenReturn(null);

        AppointmentDTO dto = new AppointmentDTO();
        dto.setDoctorId(1);
        dto.setPatientId(2L);
        dto.setAppointmentDate(LocalDate.of(2025, 11, 10));

        assertThrows(IllegalArgumentException.class, () -> appointmentService.bookAppointment(dto, "Bearer token"));
    }

    @Test
    void testBookAppointment_DoctorNotAvailable() {
        AppointmentDTO dto = new AppointmentDTO();
        dto.setDoctorId(1);
        dto.setPatientId(2L);
        dto.setAppointmentDate(LocalDate.of(2025, 11, 10));

        TokenValidationResponse token = new TokenValidationResponse(true, "user@example.com", UserRole.PATIENT);
        DoctorResponseDTO doctor = new DoctorResponseDTO();
        doctor.setAvailableDays("WEDNESDAY");
        PatientResponseDTO patient = new PatientResponseDTO();

        when(authClient.validateToken(anyString())).thenReturn(token);
        when(userClient.getDoctorById(1, "Bearer token")).thenReturn(doctor);
        when(userClient.getPatientById(2L, "Bearer token")).thenReturn(patient);

        assertThrows(IllegalArgumentException.class, () -> appointmentService.bookAppointment(dto, "Bearer token"));
    }

    @Test
    void testGetAppointmentById_Success() {
        Appointment appointment = new Appointment();
        appointment.setId(1L);
        appointment.setDoctorId(1);
        appointment.setPatientId(2L);

        TokenValidationResponse token = new TokenValidationResponse(true, "user@example.com", UserRole.DOCTOR);
        DoctorResponseDTO doctor = new DoctorResponseDTO();
        doctor.setEmailId("user@example.com");
        PatientResponseDTO patient = new PatientResponseDTO();
        patient.setEmailId("other@example.com");

        when(authClient.validateToken(anyString())).thenReturn(token);
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
        when(userClient.getDoctorById(1, "Bearer token")).thenReturn(doctor);
        when(userClient.getPatientById(2L, "Bearer token")).thenReturn(patient);

        Appointment result = appointmentService.getAppointmentById(1L, "Bearer token");
        assertEquals(1L, result.getId());
    }

    @Test
    void testGetAppointmentById_InvalidToken() {
        TokenValidationResponse token = new TokenValidationResponse(false, null, null);
        when(authClient.validateToken(anyString())).thenReturn(token);

        assertThrows(ResponseStatusException.class, () -> appointmentService.getAppointmentById(1L, "Bearer token"));
    }

    @Test
    void testGetAppointmentById_AccessDenied() {
        Appointment appointment = new Appointment();
        appointment.setId(1L);
        appointment.setDoctorId(1);
        appointment.setPatientId(2L);

        TokenValidationResponse token = new TokenValidationResponse(true, "unauthorized@example.com", UserRole.PATIENT);
        DoctorResponseDTO doctor = new DoctorResponseDTO();
        doctor.setEmailId("doctor@example.com");
        PatientResponseDTO patient = new PatientResponseDTO();
        patient.setEmailId("patient@example.com");

        when(authClient.validateToken(anyString())).thenReturn(token);
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
        when(userClient.getDoctorById(1, "Bearer token")).thenReturn(doctor);
        when(userClient.getPatientById(2L, "Bearer token")).thenReturn(patient);

        assertThrows(ResponseStatusException.class, () -> appointmentService.getAppointmentById(1L, "Bearer token"));
    }

    @Test
    void testUpdateAppointment_Success() {
        Appointment existing = new Appointment();
        existing.setId(1L);

        Appointment updated = new Appointment();
        updated.setAppointmentDate(LocalDate.of(2025, 11, 12));
        updated.setTimeSlot("10:00 AM");

        TokenValidationResponse token = new TokenValidationResponse(true, "user@example.com", UserRole.DOCTOR);

        when(authClient.validateToken(anyString())).thenReturn(token);
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(existing);

        Appointment result = appointmentService.updateAppointment(1L, updated, "Bearer token");

        assertEquals(1L, result.getId());
        assertEquals("10:00 AM", result.getTimeSlot());
    }

    @Test
    void testUpdateAppointment_InvalidToken() {
        TokenValidationResponse token = new TokenValidationResponse(false, null, null);
        when(authClient.validateToken(anyString())).thenReturn(token);

        Appointment updated = new Appointment();
        assertThrows(ResponseStatusException.class, () -> appointmentService.updateAppointment(1L, updated, "Bearer token"));
    }

    @Test
    void testUpdateAppointment_NotFound() {
        TokenValidationResponse token = new TokenValidationResponse(true, "user@example.com", UserRole.DOCTOR);
        when(authClient.validateToken(anyString())).thenReturn(token);
        when(appointmentRepository.findById(1L)).thenReturn(Optional.empty());

        Appointment updated = new Appointment();
        assertThrows(RuntimeException.class, () -> appointmentService.updateAppointment(1L, updated, "Bearer token"));
    }

    @Test
    void testDeleteAppointmentById_Success() {
        Appointment appointment = new Appointment();
        appointment.setId(1L);

        TokenValidationResponse token = new TokenValidationResponse(true, "user@example.com", UserRole.DOCTOR);

        when(authClient.validateToken(anyString())).thenReturn(token);
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));

        assertDoesNotThrow(() -> appointmentService.deleteAppointmentById(1L, "Bearer token"));
        verify(appointmentRepository).delete(appointment);
    }

    @Test
    void testDeleteAppointmentById_InvalidToken() {
        TokenValidationResponse token = new TokenValidationResponse(false, null, null);
        when(authClient.validateToken(anyString())).thenReturn(token);

        assertThrows(ResponseStatusException.class, () -> appointmentService.deleteAppointmentById(1L, "Bearer token"));
    }

    @Test
    void testDeleteAppointmentById_NotFound() {
        TokenValidationResponse token = new TokenValidationResponse(true, "user@example.com", UserRole.DOCTOR);
        when(authClient.validateToken(anyString())).thenReturn(token);
        when(appointmentRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> appointmentService.deleteAppointmentById(1L, "Bearer token"));
    }

    @Test
    void testGetAllAppointments_Success() {
        String authHeader = "Bearer valid-token";

        TokenValidationResponse tokenResponse = new TokenValidationResponse(true, "doc1@gmail.com", UserRole.DOCTOR);
        when(authClient.validateToken(authHeader)).thenReturn(tokenResponse);

        Appointment appointment = new Appointment();
        appointment.setId(1);
        appointment.setDoctorId(101);
        appointment.setPatientId(201);
        appointment.setAppointmentDate(LocalDate.now());

        when(appointmentRepository.findAll()).thenReturn(List.of(appointment));

        AppointmentResponseDTO dto = new AppointmentResponseDTO();
        dto.setId(1);
        dto.setAppointmentDate(LocalDate.now());

        when(appointmentMapper.toResponseDTO(appointment)).thenReturn(dto);
        when(userClient.getDoctorById(101, authHeader)).thenReturn(new DoctorResponseDTO());
        when(userClient.getPatientById(201, authHeader)).thenReturn(new PatientResponseDTO());

        List<AppointmentResponseDTO> result = appointmentService.getAllAppointments(authHeader);

        assertEquals(1, result.size());
        assertEquals(1, result.get(0).getId());
        verify(appointmentRepository).findAll();
        verify(authClient).validateToken(authHeader);
        verify(userClient).getDoctorById(101, authHeader);
        verify(userClient).getPatientById(201, authHeader);
    }

    @Test
    void testGetAllAppointments_InvalidToken() {
        String authHeader = "Bearer invalid-token";

        TokenValidationResponse tokenResponse = new TokenValidationResponse(false, null, null);
        when(authClient.validateToken(authHeader)).thenReturn(tokenResponse);

        assertThrows(ResponseStatusException.class, () -> appointmentService.getAllAppointments(authHeader));
    }
}
