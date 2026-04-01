package com.cts.service;

import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.cts.dto.UserDto;
import com.cts.dto.UserInputDto;
import com.cts.dto.UserLoginDto;
import com.cts.entity.Users;
import com.cts.repository.UsersRepository;
import com.cts.exception.UsersNotFoundException;
import com.cts.exception.EmailAlreadyExistsException;
import com.cts.util.MapperUtility;

@Service
public class UsersServiceImpl implements UsersService {
	private static final Logger log = LoggerFactory.getLogger(UsersServiceImpl.class);
    private UsersRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private MapperUtility mapperUtility;

    public UsersServiceImpl(UsersRepository userRepository, PasswordEncoder passwordEncoder, MapperUtility mapperUtility) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.mapperUtility = mapperUtility;
	}

	@Override
    public UserDto registerUser(UserInputDto userInputDto) {
		log.info("Attempting to register new user with email: {}", userInputDto.getEmailId());
        if (userRepository.existsByEmailId(userInputDto.getEmailId())) {
        	log.warn("Registration failed: Email already exists: {}", userInputDto.getEmailId());
            throw new EmailAlreadyExistsException("User already exists with email: " + userInputDto.getEmailId());
        }

        Users user = mapperUtility.convertToEntity(userInputDto);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setStatus(true); 
        user = userRepository.save(user);

        log.info("Successfully registered user with email: {}", user.getEmailId());
        return mapperUtility.convertToDto(user);
    }

    @Override
    public UserDto loginUser(UserLoginDto loginDto) {
    	log.info("Attempting login for user: {}", loginDto.getEmailId());
        Users user = userRepository.findById(loginDto.getEmailId()).orElseThrow(() -> new UsersNotFoundException("User not found with email: " + loginDto.getEmailId()));
        if (!passwordEncoder.matches(loginDto.getPassword(), user.getPassword())) {
        	log.warn("Login failed: Invalid password for email: {}", loginDto.getEmailId());
            throw new UsersNotFoundException("Invalid password for email: " + loginDto.getEmailId());
        }

        log.info("Successfully authenticated user: {}", loginDto.getEmailId());
        return mapperUtility.convertToDto(user);
    }

    @Override
    public boolean isUserValid(String emailId) {
    	log.info("Checking user validity for: {}", emailId);
        Users user = userRepository.findById(emailId).orElseThrow(() -> new UsersNotFoundException("User not found with email: " + emailId));
        log.info("User {} status: {}", emailId, user.isStatus());
        return user.isStatus();
    }

    @Override
    public UserDto getUserByEmail(String emailId) {
    	log.info("Attempting to get user by email: {}", emailId);
    	Users user = userRepository.findById(emailId).orElseThrow(() -> new UsersNotFoundException("User not found with email: " + emailId));
        log.warn("log.warn(\"Failed to get user: User not found with email: {}\", emailId);", emailId);
        return mapperUtility.convertToDto(user);
    }
    
    @Override
    public UserDto updateUser(String emailId, UserInputDto updatedDto) {
    	log.info("Attempting to (partially) update user: {}", emailId);
        Users existingUser = userRepository.findById(emailId).orElseThrow(() -> new UsersNotFoundException("User not found with email: " + emailId));

        Users updatedUser = mapperUtility.convertToEntity(updatedDto);

        existingUser.setName(updatedUser.getName());
        if (updatedDto.getPassword() != null && !updatedDto.getPassword().isBlank()) {
        	log.debug("Updating password for user: {}", emailId);
            existingUser.setPassword(passwordEncoder.encode(updatedDto.getPassword()));
        }
        existingUser.setDateOfBirth(updatedUser.getDateOfBirth());
        existingUser.setGender(updatedUser.getGender());
        existingUser.setPhoneNumber(updatedUser.getPhoneNumber());
        existingUser.setAddress(updatedUser.getAddress());
        existingUser.setAvatar(updatedUser.getAvatar());
        existingUser.setUserRole(updatedUser.getUserRole());
        existingUser.setStatus(updatedUser.isStatus());

        existingUser = userRepository.save(existingUser);
        log.info("Successfully updated user: {}", emailId);
        return mapperUtility.convertToDto(existingUser);
    }

    @Override
    public UserDto replaceUser(String emailId, UserInputDto updatedDto) {
    	log.info("Attempting to (fully) replace user: {}", emailId);
        userRepository.findById(emailId).orElseThrow(() -> new UsersNotFoundException("User not found with email: " + emailId));

        Users updatedUser = mapperUtility.convertToEntity(updatedDto);
        updatedUser.setEmailId(emailId);
        updatedUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        updatedUser = userRepository.save(updatedUser);

        log.info("Successfully replaced user: {}", emailId);
        return mapperUtility.convertToDto(updatedUser);
    }
}
