package com.cts.serviceimpl;

import com.cts.client.AuthClient;
import com.cts.dto.*;
import com.cts.entity.Patient;
import com.cts.exceptions.PatientNotFoundException;
import com.cts.mapper.PatientMapper;
import com.cts.repository.PatientRepository;
import com.cts.service.PatientService;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PatientServiceImpl implements PatientService {

	private static final Logger logger = LoggerFactory.getLogger(PatientServiceImpl.class);

	private final PatientRepository pRepo;
	private final AuthClient userClient;
	private final PatientMapper patientMapper;

	public PatientServiceImpl(PatientRepository pRepo, AuthClient userClient) {
		this.pRepo = pRepo;
		this.userClient = userClient;
		this.patientMapper = new PatientMapper();
	}

	@Override
	@Transactional
	public PatientResponseDTO addPatient(PatientRequestDTO dto, String authHeader) {
		TokenValidationResponse validateResponse = userClient.validateToken(authHeader);
		String emailId = validateResponse.getEmailId();
		logger.info("Attempting to save patient for email: {}", emailId);

		if (!validateResponse.isValid() || validateResponse.getUserRole() != UserRole.PATIENT) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token or role");
		}

		Patient existingPatient = pRepo.findByEmailId(emailId);
		if (existingPatient != null) {
			logger.warn("Patient profile already exists for email: {}", emailId);
			throw new ResponseStatusException(HttpStatus.CONFLICT,
					"Patient profile already exists for email: " + emailId);
		}

		Patient patient = PatientMapper.toEntity(dto);
		patient.setEmailId(emailId);
		patient.setCreatedAt(LocalDate.now());

		Patient savedPatient = pRepo.save(patient);
		logger.info("Patient saved successfully for email: {}", emailId);

		return patientMapper.toDTO(savedPatient);
	}

	@Override
	public List<PatientResponseDTO> getAllPatients() {
		return pRepo.findAll().stream().map(patientMapper::toDTO).collect(Collectors.toList());
	}

	@Override
	public PatientResponseDTO getPatientById(long id) {
		Patient patient = pRepo.findById(id)
				.orElseThrow(() -> new PatientNotFoundException("Patient " + id + " is not found"));
		return patientMapper.toDTO(patient);
	}

	@Override
	@Transactional
	public PatientResponseDTO updatePatient(PatientRequestDTO dto, long id, String authHeader) {
		Patient existingPatient = pRepo.findById(id)
				.orElseThrow(() -> new PatientNotFoundException("Patient not found with ID: " + id));

		String emailId = dto.getEmailId();
		if (emailId == null || emailId.isBlank()) {
			throw new IllegalArgumentException("Email ID is missing.");
		}

		UserResponse existingUser = userClient.getUserByEmail(emailId, authHeader);
		if (existingUser == null || existingUser.getUserRole() != UserRole.PATIENT) {
			throw new IllegalArgumentException("User is not a valid patient.");
		}

		Patient conflict = pRepo.findByEmailId(emailId);
		if (conflict != null && conflict.getId() != id) {
			throw new IllegalArgumentException("This user is already assigned to another patient.");
		}

		existingPatient.setEmailId(emailId);
		existingPatient.setBloodType(dto.getBloodType());
		existingPatient.setEmergencyContact(dto.getEmergencyContact());
		existingPatient.setMedicalHistory(dto.getMedicalHistory());
		existingPatient.setAllergies(dto.getAllergies());
		existingPatient.setHomeAddress(dto.getHomeAddress());

		Patient updated = pRepo.save(existingPatient);
		return patientMapper.toDTO(updated);
	}

	@Override
	public PatientResponseDTO getPatientByemailId(String emailId) {
		Patient patient = pRepo.findByEmailId(emailId);
		if (patient == null)
			throw new PatientNotFoundException("Patient " + emailId + " is not found");
		return patientMapper.toDTO(patient);
	}
}
