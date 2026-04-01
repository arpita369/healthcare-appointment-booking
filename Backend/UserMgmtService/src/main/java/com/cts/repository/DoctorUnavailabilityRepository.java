package com.cts.repository;

import com.cts.entity.DoctorUnavailability;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface DoctorUnavailabilityRepository extends JpaRepository<DoctorUnavailability, Long> {
	List<DoctorUnavailability> findByDoctor_Id(Long doctorId);

	List<DoctorUnavailability> findByDoctorIdAndDate(int doctorId, LocalDate date);

}