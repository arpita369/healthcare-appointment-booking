package com.cts.controller;

import com.cts.config.JwtUtil;
import com.cts.dto.TokenValidationResponse;
import com.cts.dto.UserDto;
import com.cts.dto.UserInputDto;
import com.cts.dto.UserLoginDto;
import com.cts.service.UsersService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@Tag(name = "AUTH MODULE", description = "Operations related to user")
@RequestMapping("/api/v1/user")
public class UsersController {

    private static final Logger log = LoggerFactory.getLogger(UsersController.class);

    private final UsersService userService;
    private final JwtUtil jwtUtil;

    public UsersController(UsersService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Creates a new user account with the provided details. Returns the registered user information.")
    public ResponseEntity<UserDto> registerUser(@RequestBody @Valid UserInputDto user) {
        log.info("Received request to register new user with email: {}", user.getEmailId());
        log.debug("Registration DTO: {}", user);
        
        UserDto registeredUser = userService.registerUser(user);
        
        log.info("Successfully registered user with email: {}", registeredUser.getEmailId());
        return new ResponseEntity<UserDto>(registeredUser,HttpStatus.CREATED);
    }

    @PostMapping("/login")
    @Operation(summary = "Login and return JWT token", description = "Authenticates the user using email and password. Returns a JWT token if credentials are valid.")
    public ResponseEntity<Map<String,String>> loginUser(@RequestBody UserLoginDto loginRequest) {
        log.info("Received login attempt for user: {}", loginRequest.getEmailId());
        
        UserDto user = userService.loginUser(loginRequest);
        String token = jwtUtil.generateToken(user.getEmailId());
        
        log.info("Successfully authenticated user and generated token for: {}", user.getEmailId());
        Map<String,String> map =new HashMap<>();
        map.put("token", token);
        return new ResponseEntity<>(map,HttpStatus.OK);
    }

    @GetMapping("/{emailId}")
    @Operation(summary = "Get user by email", description = "Fetches user details based on the provided email ID.")
    public ResponseEntity<UserDto>  getUserByEmail(@PathVariable String emailId) {
        log.info("Received request to get user by email: {}", emailId);
        UserDto user = userService.getUserByEmail(emailId);
        log.info("Successfully retrieved user details for: {}", emailId);
        return new ResponseEntity<UserDto>(user,HttpStatus.OK);
    }

    @GetMapping("/validate-token")
    @Operation(summary = "Token validation", description = "Validates the JWT token from the Authorization header. Returns user details if valid.")
    public ResponseEntity<TokenValidationResponse> validateToken(@RequestHeader("Authorization") String authHeader) {
        log.info("Received request to validate token");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("Token validation failed: Missing or invalid Authorization Bearer header.");
            return ResponseEntity.ok(new TokenValidationResponse(false, null, null));
        }

        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            log.warn("Token validation failed: Invalid JWT token.");
            return ResponseEntity.ok(new TokenValidationResponse(false, null, null));
        }

        String email = jwtUtil.extractEmail(token);
        UserDto userDto = userService.getUserByEmail(email);
        if (userDto == null) {
            log.warn("Token validation failed: User not found for email extracted from token: {}", email);
            return ResponseEntity.ok(new TokenValidationResponse(false, null, null));
        }

        log.info("Successfully validated token for user: {}", email);
        return ResponseEntity.ok(new TokenValidationResponse(true, userDto.getEmailId(), userDto.getUserRole()));
    }

    @GetMapping("/validate/{emailId}")
    @Operation(summary = "Validate user status", description = "Checks if the user with the given email ID is valid and active in the system.")
    public boolean isUserValid(@PathVariable String emailId) {
        log.info("Received request to validate user status for: {}", emailId);
        boolean isValid = userService.isUserValid(emailId);
        log.info("User validation status for {}: {}", emailId, isValid);
        return isValid;
    }
    
    @PatchMapping("/{emailId}")
    @Operation(summary = "Update user partially", description = "Updates specific fields of the user identified by email ID. Useful for partial updates.")
    public UserDto updateUser(@PathVariable String emailId, @RequestBody UserInputDto updatedUser) {
        log.info("Received request to partially update user: {}", emailId);
        log.debug("Update DTO: {}", updatedUser);
        
        UserDto user = userService.updateUser(emailId, updatedUser);
        
        log.info("Successfully updated user: {}", emailId);
        return user;
    }

    @PutMapping("/{emailId}")
    @Operation(summary = "Replace user completely", description = "Replaces the entire user record with new data for the given email ID.")
    public UserDto replaceUser(@PathVariable String emailId, @RequestBody UserInputDto updatedUser) {
        log.info("Received request to replace user: {}", emailId);
        log.debug("Replacement DTO: {}", updatedUser);
        
        UserDto user = userService.replaceUser(emailId, updatedUser);
        
        log.info("Successfully replaced user: {}", emailId);
        return user;
    }
}