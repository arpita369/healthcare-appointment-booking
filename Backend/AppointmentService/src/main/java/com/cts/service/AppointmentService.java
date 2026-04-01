package com.cts.service;

import com.cts.dto.AppointmentDTO;
import com.cts.dto.AppointmentResponseDTO;
import com.cts.dto.CancelDTO;
import com.cts.entity.Appointment;

import java.util.List;

public interface AppointmentService {
    AppointmentDTO bookAppointment(AppointmentDTO dto, String authHeader);
    Appointment getAppointmentById(long id, String authHeader);
    Appointment updateAppointment(long id, Appointment updatedAppointment, String authHeader);
    List<AppointmentResponseDTO> getAllAppointments(String authHeader);
    void deleteAppointmentById(long id, String authHeader);
	AppointmentDTO cancelAppointment(Long appointmentId, String authHeader);
	boolean cancelAppointmentbyDoctorUnavail(CancelDTO cancelDTO );
}
