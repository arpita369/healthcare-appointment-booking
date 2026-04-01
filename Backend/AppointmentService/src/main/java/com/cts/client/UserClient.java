package com.cts.client;

import java.time.LocalDate;
import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import com.cts.dto.DoctorResponseDTO;
import com.cts.dto.DoctorUnavailabilityResponseDTO;
import com.cts.dto.PatientResponseDTO;



@FeignClient(name = "USERMGMTSERVICE")
public interface UserClient {

	@GetMapping("/app2/api/v1/doctors/{doctorId}")
	DoctorResponseDTO getDoctorById(@PathVariable("doctorId") int id, @RequestHeader("Authorization") String authHeader);

	@GetMapping("/app2/api/v1/patients/{patientId}")
	PatientResponseDTO getPatientById(@PathVariable("patientId") long id, @RequestHeader("Authorization") String authHeader);
	

	
	@GetMapping("app2/api/doctors/availability/{doctorId}/unavailable/date")
    ResponseEntity<List<DoctorUnavailabilityResponseDTO>> getUnavailabilityByDate( 
            @PathVariable("doctorId") int doctorId,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestHeader("Authorization") String authHeader
    );
}
