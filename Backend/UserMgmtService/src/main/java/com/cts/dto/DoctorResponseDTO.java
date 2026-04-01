package com.cts.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorResponseDTO {
	private int id;
	private int fee;
	private String specialization;
	private String experience;
	private String licenseNo;
	private String availableDays;
	private String startTime;
	private String endTime;
	private String emailId;
}