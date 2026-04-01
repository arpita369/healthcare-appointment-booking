package com.cts.controller;

import com.cts.dto.AppointmentDTO;
import com.cts.dto.AppointmentResponseDTO;
import com.cts.entity.Appointment;
import com.cts.service.AppointmentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AppointmentControllerTest {

    @Mock
    private AppointmentService appointmentService;

    @InjectMocks
    private AppointmentController appointmentController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testBookAppointment_Success() {
        AppointmentDTO dto = new AppointmentDTO();
        dto.setAppointmentDate(LocalDate.of(2025, 11, 10));
        dto.setDoctorId(1);
        dto.setPatientId(2L);

        when(appointmentService.bookAppointment(dto, "Bearer token")).thenReturn(dto);

        ResponseEntity<?> response = appointmentController.bookAppointment(dto, "Bearer token");

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(dto, response.getBody());
        verify(appointmentService).bookAppointment(dto, "Bearer token");
    }

    @Test
    void testBookAppointment_Failure() {
        AppointmentDTO dto = new AppointmentDTO();
        dto.setAppointmentDate(LocalDate.of(2025, 11, 10));

        when(appointmentService.bookAppointment(dto, "Bearer token")).thenThrow(new IllegalArgumentException("Invalid data"));

        ResponseEntity<?> response = appointmentController.bookAppointment(dto, "Bearer token");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Invalid data", response.getBody());
        verify(appointmentService).bookAppointment(dto, "Bearer token");
    }

    @Test
    void testBookAppointment_BadRequest() {
        AppointmentDTO requestDTO = new AppointmentDTO();
        
        when(appointmentService.bookAppointment(requestDTO, "Bearer token")).thenThrow(new IllegalArgumentException("Invalid appointment data"));

        ResponseEntity<?> response = appointmentController.bookAppointment(requestDTO, "Bearer token");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Invalid appointment data", response.getBody());
        verify(appointmentService).bookAppointment(requestDTO, "Bearer token");
    }

    @Test
    void testBookAppointment_InternalServerError() {
        AppointmentDTO requestDTO = new AppointmentDTO();
        
        when(appointmentService.bookAppointment(requestDTO, "Bearer token")).thenThrow(new RuntimeException("Database error"));

        ResponseEntity<?> response = appointmentController.bookAppointment(requestDTO, "Bearer token");

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("Unexpected error occurred.", response.getBody());
        verify(appointmentService).bookAppointment(requestDTO, "Bearer token");
    }

    @Test
    void testGetAppointmentById() {
        Appointment appointment = new Appointment();
        appointment.setId(1L);

        when(appointmentService.getAppointmentById(1L, "Bearer token")).thenReturn(appointment);

        ResponseEntity<Appointment> response = appointmentController.getAppointment(1L, "Bearer token");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1L, response.getBody().getId());
        verify(appointmentService).getAppointmentById(1L, "Bearer token");
    }

    @Test
    void testUpdateAppointment() {
        Appointment updated = new Appointment();
        updated.setId(1L);
        updated.setTimeSlot("10:00 AM");

        when(appointmentService.updateAppointment(1L, updated, "Bearer token")).thenReturn(updated);

        ResponseEntity<Appointment> response = appointmentController.updateAppointment(1L, updated, "Bearer token");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("10:00 AM", response.getBody().getTimeSlot());
        verify(appointmentService).updateAppointment(1L, updated, "Bearer token");
    }

    @Test
    void testGetAllAppointments() {
        List<AppointmentResponseDTO> appointments = List.of(new AppointmentResponseDTO(), new AppointmentResponseDTO());

        when(appointmentService.getAllAppointments("Bearer token")).thenReturn(appointments);

        ResponseEntity<List<AppointmentResponseDTO>> response = appointmentController.getAllAppointments("Bearer token");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(2, response.getBody().size());
        verify(appointmentService).getAllAppointments("Bearer token");
    }

    @Test
    void testDeleteAppointment_Success() {
        doNothing().when(appointmentService).deleteAppointmentById(1L, "Bearer token");

        ResponseEntity<String> response = appointmentController.deleteAppointment(1L, "Bearer token");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Appointment deleted successfully.", response.getBody());
        verify(appointmentService).deleteAppointmentById(1L, "Bearer token");
    }

    @Test
    void testDeleteAppointment_NotFound() {
        doThrow(new IllegalArgumentException("Appointment not found")).when(appointmentService).deleteAppointmentById(999L, "Bearer token");

        ResponseEntity<String> response = appointmentController.deleteAppointment(999L, "Bearer token");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Appointment not found.", response.getBody());
        verify(appointmentService).deleteAppointmentById(999L, "Bearer token");
    }

    @Test
    void testDeleteAppointment_InternalServerError() {
        doThrow(new RuntimeException("Database error")).when(appointmentService).deleteAppointmentById(500L, "Bearer token");

        ResponseEntity<String> response = appointmentController.deleteAppointment(500L, "Bearer token");

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("Unexpected error occurred.", response.getBody());
        verify(appointmentService).deleteAppointmentById(500L, "Bearer token");
    }
}