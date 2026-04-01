package com.cts.serviceimpl;

import com.cts.client.AuthClient;
import com.cts.dto.DoctorRequestDTO;
import com.cts.dto.DoctorResponseDTO;
import com.cts.dto.TokenValidationResponse;
import com.cts.dto.UserRole;
import com.cts.entity.Doctor;
import com.cts.exceptions.ResourceNotFoundException;
import com.cts.mapper.DoctorMapper;
import com.cts.repository.DoctorRepository;
import com.cts.service.DoctorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DoctorServiceImpl implements DoctorService {

	private final DoctorRepository doctorRepository;
	private final AuthClient userClient;
	private final DoctorMapper doctorMapper;

	private static final Logger logger = LoggerFactory.getLogger(DoctorServiceImpl.class);

	public DoctorServiceImpl(DoctorRepository doctorRepository, AuthClient userClient) {
		this.doctorRepository = doctorRepository;
		this.userClient = userClient;
		this.doctorMapper = new DoctorMapper();
	}

	@Override
	@Transactional
	public DoctorResponseDTO saveDoctor(DoctorRequestDTO doctorDTO, String authHeader) {
		TokenValidationResponse validateResponse = userClient.validateToken(authHeader);
		String emailId = validateResponse.getEmailId();
		logger.info("Attempting to save doctor for email: {}", emailId);

		if (!validateResponse.isValid())
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");

		if (validateResponse.getUserRole() != UserRole.DOCTOR)
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");

		Optional<Doctor> existingDoctor = doctorRepository.findByUserEmailId(emailId);
		if (existingDoctor.isPresent()) {
			logger.warn("Doctor profile already exists for email: {}", emailId);
			throw new ResponseStatusException(HttpStatus.CONFLICT,
					"Doctor profile already exists for email: " + emailId);
		}

		Doctor doctor = DoctorMapper.toEntity(doctorDTO);
		doctor.setEmailId(emailId);

		Doctor savedDoctor = doctorRepository.save(doctor);
		logger.info("Doctor saved successfully for email: {}", emailId);

		return doctorMapper.toDTO(savedDoctor);
	}

	@Override
	public DoctorResponseDTO updateDoctor(String doctorId, DoctorRequestDTO updatedDoctorDTO, String authHeader) {
		TokenValidationResponse validateResponse = userClient.validateToken(authHeader);
		logger.info("Updating doctor with ID: {}", doctorId);

		int id = parseDoctorId(doctorId);

		if (!validateResponse.isValid() || validateResponse.getUserRole() != UserRole.DOCTOR)
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");

		Doctor existingDoctor = doctorRepository.findById(id).orElseThrow(() -> {
			logger.error("Doctor not found with ID: {}", doctorId);
			return new ResourceNotFoundException("Doctor not found with ID: " + doctorId);
		});

		existingDoctor.setSpecialization(updatedDoctorDTO.getSpecialization());
		existingDoctor.setFee(updatedDoctorDTO.getFee());
		existingDoctor.setExperience(updatedDoctorDTO.getExperience());
		existingDoctor.setAvailableDays(updatedDoctorDTO.getAvailableDays());
		existingDoctor.setLicenseNo(updatedDoctorDTO.getLicenseNo());
		existingDoctor.setStartTime(updatedDoctorDTO.getStartTime());
		existingDoctor.setEndTime(updatedDoctorDTO.getEndTime());

		Doctor updatedDoctor = doctorRepository.save(existingDoctor);
		logger.info("Doctor updated successfully with ID: {}", doctorId);

		return doctorMapper.toDTO(updatedDoctor);
	}

	@Override
	public List<DoctorResponseDTO> getAllDoctors() {
		logger.info("Fetching all doctors");
		return doctorRepository.findAll().stream().map(doctorMapper::toDTO).collect(Collectors.toList());
	}

	@Override
	public DoctorResponseDTO getDoctorByEmailId(String doctorId) {
		logger.info("Fetching doctor by ID: {}", doctorId);
		int id = parseDoctorId(doctorId);
		Doctor doctor = doctorRepository.findById(id).orElseThrow(() -> {
			logger.error("Doctor not found with ID: {}", doctorId);
			return new ResourceNotFoundException("Doctor not found with ID: " + doctorId);
		});
		return doctorMapper.toDTO(doctor);
	}

	@Override
	public List<DoctorResponseDTO> getDoctorsBySpecialization(String specialization) {
		logger.info("Fetching doctors by specialization: {}", specialization);
		List<Doctor> doctors = doctorRepository.findBySpecialization(specialization);
		if (doctors.isEmpty()) {
			logger.warn("No doctors found with specialization: {}", specialization);
			throw new ResourceNotFoundException("No doctors found with specialization: " + specialization);
		}
		return doctors.stream().map(doctorMapper::toDTO).collect(Collectors.toList());
	}

	@Override
	public List<DoctorResponseDTO> getDoctorsByAvailableDay(String day) {
		logger.info("Fetching doctors available on: {}", day);
		List<Doctor> doctors = doctorRepository.findByAvailableDay(day);
		if (doctors.isEmpty()) {
			logger.warn("No doctors available on: {}", day);
			throw new ResourceNotFoundException("No doctors available on: " + day);
		}
		return doctors.stream().map(doctorMapper::toDTO).collect(Collectors.toList());
	}

	@Override
	public DoctorResponseDTO getDoctorByLicenseNo(String licenseNo) {
		logger.info("Fetching doctor by license number: {}", licenseNo);
		Doctor doctor = doctorRepository.findByLicenseNo(licenseNo);
		if (doctor == null) {
			logger.error("Doctor not found with License No: {}", licenseNo);
			throw new ResourceNotFoundException("Doctor not found with License No: " + licenseNo);
		}
		return doctorMapper.toDTO(doctor);
	}

	private int parseDoctorId(String doctorId) {
		try {
			return Integer.parseInt(doctorId);
		} catch (NumberFormatException e) {
			logger.error("Invalid doctor ID format: {}", doctorId);
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid doctor ID format");
		}
	}

	@Override
	public DoctorResponseDTO getDoctorByEmail(String emailId) {
		logger.info("Fetching doctor by emailId: {}", emailId);

		Doctor doctor = doctorRepository.findByEmailId(emailId).orElseThrow(() -> {
			logger.error("Doctor not found with emailId: {}", emailId);
			return new ResourceNotFoundException("Doctor not found with emailId: " + emailId);
		});

		return doctorMapper.toDTO(doctor);

	}
}
