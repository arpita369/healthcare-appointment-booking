package com.cts.repository;

import com.cts.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {
	@Query("select feedback from Feedback feedback where feedback.doctor.id=?1")
	List<Feedback> findByDoctorId(int doctorId);

	@Query("select feedback from Feedback feedback where feedback.patient.id=?1")
	List<Feedback> findByPatientId(int patientId);
}
