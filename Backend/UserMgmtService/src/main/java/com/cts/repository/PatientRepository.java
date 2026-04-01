package com.cts.repository;

import com.cts.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientRepository extends JpaRepository<Patient, Long> {
	boolean existsByEmailId(String emailId);

	Patient findByEmailId(String emailId);
}
