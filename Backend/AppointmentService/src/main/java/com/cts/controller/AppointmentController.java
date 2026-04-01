package com.cts.controller;

import com.cts.dto.AppointmentDTO;
import com.cts.dto.AppointmentResponseDTO;
import com.cts.dto.CancelDTO;
import com.cts.entity.Appointment;
import com.cts.exceptions.ResourceNotFoundException;
import com.cts.service.AppointmentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Tag(name = "APPOINTMENT MODULE", description = "Operations related to appointment")
@RequestMapping("/api/v1/appointments")
public class AppointmentController {

    private AppointmentService appointmentService;
    
    public AppointmentController(AppointmentService appointmentService) {
		this.appointmentService = appointmentService;
	}

	private static final Logger logger = LoggerFactory.getLogger(AppointmentController.class);
    
    @PostMapping("/book")
    @Operation(summary = "Book appointment", description = "Allows a patient to book an appointment with a doctor. Requires valid appointment details and authorization token.")
    public ResponseEntity<?> bookAppointment(@Valid @RequestBody AppointmentDTO dto, @RequestHeader("Authorization") String authHeader) {
        try {
            AppointmentDTO saved = appointmentService.bookAppointment(dto, authHeader);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error while booking appointment", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error occurred.");
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get appointment by ID", description = "Fetches the details of a specific appointment using its ID. Requires authorization token.")
    public ResponseEntity<Appointment> getAppointment(@PathVariable long id, @RequestHeader("Authorization") String authHeader) {
        Appointment appointment = appointmentService.getAppointmentById(id, authHeader);
        return ResponseEntity.ok(appointment);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update appointment by ID", description = "Updates the details of an existing appointment identified by its ID. Requires updated appointment data and authorization token.")
    public ResponseEntity<Appointment> updateAppointment(@PathVariable long id, @RequestBody Appointment updatedAppointment, @RequestHeader("Authorization") String authHeader) {
        Appointment appointment = appointmentService.updateAppointment(id, updatedAppointment, authHeader);
        return ResponseEntity.ok(appointment);
    }

    @GetMapping
    @Operation(summary = "Get All Appointments", description = "Retrieves a list of all appointments for the authorized user.")
    public ResponseEntity<List<AppointmentResponseDTO>> getAllAppointments(@RequestHeader("Authorization") String authHeader) {
        List<AppointmentResponseDTO> appointments = appointmentService.getAllAppointments(authHeader);
        return ResponseEntity.ok(appointments);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Appointment by ID", description = "Deletes an appointment identified by its ID. Returns success message if deleted, or error if not found.")
    public ResponseEntity<String> deleteAppointment(@PathVariable long id, @RequestHeader("Authorization") String authHeader) {
        try {
            appointmentService.deleteAppointmentById(id, authHeader);
            return ResponseEntity.ok("Appointment deleted successfully.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Appointment not found.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error occurred.");
        }
    }
    
    @PutMapping("/{appointmentId}/cancel")
    @Operation(summary = "Cancel appointment", description = "Cancels an existing appointment by changing its status to 'CANCELLED'.")
    public ResponseEntity<?> cancelAppointment(
            @PathVariable Long appointmentId, 
            @RequestHeader("Authorization") String authHeader) {
        try {
            AppointmentDTO cancelled = appointmentService.cancelAppointment(appointmentId, authHeader);
            return ResponseEntity.ok(cancelled);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error cancelling appointment with ID: {}", appointmentId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error cancelling appointment.");
        }
    }
    
    
    @PutMapping("/cancel")
    @Operation(summary = "Cancel appointment", description = "Cancels an existing appointment by changing its status to 'CANCELLED'.")
    public ResponseEntity<?> cancelAppointmentbyDoctorUnavail(
            @RequestBody CancelDTO cancelDTO)
            {
        try {
            boolean cancelled = appointmentService.cancelAppointmentbyDoctorUnavail(cancelDTO);
            System.out.println("canceled: "+cancelled);
            return ResponseEntity.ok(cancelled);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error cancelling appointment with doctorId: {}", cancelDTO.getDoctorId(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error cancelling appointment.");
        }
    }
}
