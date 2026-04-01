package com.cts.repository;

import com.cts.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Integer> {

	@Query("SELECT d FROM Doctor d WHERE d.specialization = ?1")
	List<Doctor> findBySpecialization(String specialization);

	@Query("SELECT d FROM Doctor d WHERE d.availableDays LIKE %?1%")
	List<Doctor> findByAvailableDay(String day);

	@Query("SELECT d FROM Doctor d WHERE d.licenseNo = ?1")
	Doctor findByLicenseNo(String licenseNo);

	@Query("SELECT d FROM Doctor d WHERE d.emailId = ?1")
	Optional<Doctor> findByUserEmailId(String emailId);

	Optional<Doctor> findById(long doctorId);

	Optional<Doctor> findByEmailId(String emailId);
}