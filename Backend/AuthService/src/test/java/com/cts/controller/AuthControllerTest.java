package com.cts.controller;
 
import com.cts.config.JwtUtil;
import com.cts.dto.Role;
import com.cts.dto.TokenValidationResponse;
import com.cts.dto.UserDto;
import com.cts.dto.UserInputDto;
import com.cts.dto.UserLoginDto;
import com.cts.service.UsersService;
 
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
 
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
 
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
 
import java.util.Map;
 
@ExtendWith(MockitoExtension.class)
class AuthControllerTest {
 
    @Mock
    private UsersService usersService;
 
    @Mock
    private JwtUtil jwtUtil;
 
    @InjectMocks
    private UsersController usersController;
 
    private UserDto userDto;
    private UserInputDto userInputDto;
 
    @BeforeEach
    void setUp() {
        userDto = new UserDto();
        userDto.setEmailId("test@gmail.com");
        userDto.setUserRole(Role.PATIENT);
 
        userInputDto = new UserInputDto();
        userInputDto.setEmailId("test@gmail.com");
        userInputDto.setPassword("12345");
        userInputDto.setUserRole(Role.PATIENT);
    }
 
    @Test
    void testRegisterUser_ReturnsCreatedUser() {
        when(usersService.registerUser(userInputDto)).thenReturn(userDto);
 
        ResponseEntity<UserDto> response = usersController.registerUser(userInputDto);
 
        assertEquals(201, response.getStatusCodeValue());
        assertEquals("test@gmail.com", response.getBody().getEmailId());
    }
 
    @Test
    void testLoginUser_ReturnsToken() {
        UserLoginDto loginDto = new UserLoginDto("test@gmail.com", "12345");
 
        when(usersService.loginUser(loginDto)).thenReturn(userDto);
        when(jwtUtil.generateToken("test@gmail.com")).thenReturn("mocked-token");
 
        ResponseEntity<Map<String, String>> response = usersController.loginUser(loginDto);
        Map<String, String> body = response.getBody();
 
        assertNotNull(body);
        assertEquals("mocked-token", body.get("token"));
    }
 
    @Test
    void testGetUserByEmail_ReturnsUser() {
        when(usersService.getUserByEmail("test@gmail.com")).thenReturn(userDto);
 
        ResponseEntity<UserDto> response = usersController.getUserByEmail("test@gmail.com");
 
        assertEquals(200, response.getStatusCodeValue());
        assertEquals("test@gmail.com", response.getBody().getEmailId());
    }
 
    @Test
    void testValidateToken_Valid() {
        String authHeader = "Bearer valid-token";
 
        when(jwtUtil.validateToken("valid-token")).thenReturn(true);
        when(jwtUtil.extractEmail("valid-token")).thenReturn("test@gmail.com");
        when(usersService.getUserByEmail("test@gmail.com")).thenReturn(userDto);
 
        ResponseEntity<TokenValidationResponse> response = usersController.validateToken(authHeader);
        TokenValidationResponse result = response.getBody();
 
        assertTrue(result.isValid());
        assertEquals("test@gmail.com", result.getEmailId());
        assertEquals(Role.PATIENT, result.getUserRole());
    }
 
    @Test
    void testValidateToken_InvalidToken() {
        String authHeader = "Bearer invalid-token";
 
        when(jwtUtil.validateToken("invalid-token")).thenReturn(false);
 
        ResponseEntity<TokenValidationResponse> response = usersController.validateToken(authHeader);
        TokenValidationResponse result = response.getBody();
 
        assertFalse(result.isValid());
        assertNull(result.getEmailId());
    }
 
    @Test
    void testValidateToken_MissingHeader() {
        ResponseEntity<TokenValidationResponse> response = usersController.validateToken(null);
        TokenValidationResponse result = response.getBody();
 
        assertFalse(result.isValid());
        assertNull(result.getEmailId());
    }
 
    @Test
    void testValidateToken_UserNotFound() {
        String authHeader = "Bearer valid-token";
 
        when(jwtUtil.validateToken("valid-token")).thenReturn(true);
        when(jwtUtil.extractEmail("valid-token")).thenReturn("unknown@gmail.com");
        when(usersService.getUserByEmail("unknown@gmail.com")).thenReturn(null);
 
        ResponseEntity<TokenValidationResponse> response = usersController.validateToken(authHeader);
        TokenValidationResponse result = response.getBody();
 
        assertFalse(result.isValid());
        assertNull(result.getEmailId());
    }
 
    @Test
    void testUpdateUser_ReturnsUpdatedUser() {
        when(usersService.updateUser("test@gmail.com", userInputDto)).thenReturn(userDto);
 
        UserDto result = usersController.updateUser("test@gmail.com", userInputDto);
 
        assertEquals("test@gmail.com", result.getEmailId());
    }
 
    @Test
    void testReplaceUser_ReturnsReplacedUser() {
        when(usersService.replaceUser("test@gmail.com", userInputDto)).thenReturn(userDto);
 
        UserDto result = usersController.replaceUser("test@gmail.com", userInputDto);
 
        assertEquals("test@gmail.com", result.getEmailId());
    }
 
    @Test
    void testIsUserValid_ReturnsTrue() {
        when(usersService.isUserValid("test@gmail.com")).thenReturn(true);
 
        boolean result = usersController.isUserValid("test@gmail.com");
 
        assertTrue(result);
    }
 
    @Test
    void testIsUserValid_ReturnsFalse() {
        when(usersService.isUserValid("test@gmail.com")).thenReturn(false);
 
        boolean result = usersController.isUserValid("test@gmail.com");
 
        assertFalse(result);
    }
}