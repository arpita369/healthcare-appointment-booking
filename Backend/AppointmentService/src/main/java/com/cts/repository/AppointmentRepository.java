package com.cts.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import com.cts.entity.Appointment;

import feign.Param;

public interface AppointmentRepository extends JpaRepository<Appointment, Long>{

	@Query("SELECT a FROM Appointment a WHERE a.doctorId= :doctorId " +
	           "AND a.appointmentDate = :appointmentDate " +
	           "AND a.status != 'CANCELLED'")
	    List<Appointment> findActiveAppointmentsByDoctorAndDate(
	            @Param("doctorId") int doctorId, 
	            @Param("appointmentDate") LocalDate appointmentDate);
	
	@Modifying
    @Query("UPDATE Appointment a SET a.status = 'CANCELLED' " +
           "WHERE a.doctorId = :doctorId " +
           "AND a.appointmentDate = :appointmentDate " +
           "AND a.status != 'CANCELLED'")
    int cancelAppointmentsByDoctorAndDate(
            @Param("doctorId") int doctorId,
            @Param("appointmentDate") LocalDate appointmentDate);
}
