package com.cts.client;

import com.cts.dto.CancelDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "APPOINTMENTSERVICE")
public interface AppointmentClient {

	@PutMapping("/app3/api/v1/appointments/cancel")
	public boolean cancelAppointmentbyDoctorUnavail(@RequestBody CancelDTO cancelDTO, @RequestHeader("Authorization") String authHeader);

}
