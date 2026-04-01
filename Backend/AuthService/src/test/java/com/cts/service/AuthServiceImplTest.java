package com.cts.service;

import com.cts.dto.UserDto;
import com.cts.dto.UserInputDto;
import com.cts.dto.UserLoginDto;
import com.cts.entity.Users;
import com.cts.exception.EmailAlreadyExistsException;
import com.cts.exception.UsersNotFoundException;
import com.cts.repository.UsersRepository;
import com.cts.util.MapperUtility;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UsersRepository usersRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private MapperUtility mapperUtility;

    @InjectMocks
    private UsersServiceImpl usersService;

    private UserInputDto inputDto;
    private Users userEntity;
    private UserDto userDto;

    @BeforeEach
    void setup() {
        inputDto = new UserInputDto();
        inputDto.setEmailId("test@gmail.com");
        inputDto.setPassword("12345");

        userEntity = new Users();
        userEntity.setEmailId("test@gmail.com");
        userEntity.setPassword("encoded");
        userEntity.setStatus(true);

        userDto = new UserDto();
        userDto.setEmailId("test@gmail.com");
    }

    @Test
    void testRegisterUser_EmailExists() {
        when(usersRepository.existsByEmailId("test@gmail.com")).thenReturn(true);
        assertThrows(EmailAlreadyExistsException.class, () -> usersService.registerUser(inputDto));
    }

    @Test
    void testLoginUser_Success() {
        UserLoginDto loginDto = new UserLoginDto("test@gmail.com", "12345");

        when(usersRepository.findById("test@gmail.com")).thenReturn(Optional.of(userEntity));
        when(passwordEncoder.matches("12345", "encoded")).thenReturn(true);
        when(mapperUtility.convertToDto(userEntity)).thenReturn(userDto);

        UserDto result = usersService.loginUser(loginDto);
        assertNotNull(result);
        assertEquals("test@gmail.com", result.getEmailId());
    }

    @Test
    void testLoginUser_UserNotFound() {
        UserLoginDto loginDto = new UserLoginDto("unknown@gmail.com", "12345");
        when(usersRepository.findById("unknown@gmail.com")).thenReturn(Optional.empty());

        assertThrows(UsersNotFoundException.class, () -> usersService.loginUser(loginDto));
    }

    @Test
    void testLoginUser_InvalidPassword() {
        UserLoginDto loginDto = new UserLoginDto("test@gmail.com", "wrongpass");

        when(usersRepository.findById("test@gmail.com")).thenReturn(Optional.of(userEntity));
        when(passwordEncoder.matches("wrongpass", "encoded")).thenReturn(false);

        assertThrows(UsersNotFoundException.class, () -> usersService.loginUser(loginDto));
    }

    @Test
    void testIsUserValid_True() {
        when(usersRepository.findById("test@gmail.com")).thenReturn(Optional.of(userEntity));
        boolean result = usersService.isUserValid("test@gmail.com");
        assertTrue(result);
    }

    @Test
    void testIsUserValid_UserNotFound() {
        when(usersRepository.findById("unknown@gmail.com")).thenReturn(Optional.empty());
        assertThrows(UsersNotFoundException.class, () -> usersService.isUserValid("unknown@gmail.com"));
    }

    @Test
    void testGetUserByEmail_Success() {
        when(usersRepository.findById("test@gmail.com")).thenReturn(Optional.of(userEntity));
        when(mapperUtility.convertToDto(userEntity)).thenReturn(userDto);

        UserDto result = usersService.getUserByEmail("test@gmail.com");
        assertNotNull(result);
    }

    @Test
    void testUpdateUser_Success() {
        UserInputDto updatedDto = new UserInputDto();
        updatedDto.setPassword("newpass");

        Users updatedEntity = new Users();
        updatedEntity.setPassword("newpass");

        when(usersRepository.findById("test@gmail.com")).thenReturn(Optional.of(userEntity));
        when(mapperUtility.convertToEntity(updatedDto)).thenReturn(updatedEntity);
        when(passwordEncoder.encode("newpass")).thenReturn("encoded-new");
        when(usersRepository.save(any(Users.class))).thenReturn(userEntity);
        when(mapperUtility.convertToDto(userEntity)).thenReturn(userDto);

        UserDto result = usersService.updateUser("test@gmail.com", updatedDto);
        assertNotNull(result);
    }

    @Test
    void testReplaceUser_Success() {
        UserInputDto updatedDto = new UserInputDto();
        updatedDto.setPassword("newpass");

        Users updatedEntity = new Users();
        updatedEntity.setPassword("newpass");

        when(usersRepository.findById("test@gmail.com")).thenReturn(Optional.of(userEntity));
        when(mapperUtility.convertToEntity(updatedDto)).thenReturn(updatedEntity);
        when(passwordEncoder.encode("newpass")).thenReturn("encoded-new");
        when(usersRepository.save(any(Users.class))).thenReturn(updatedEntity);
        when(mapperUtility.convertToDto(updatedEntity)).thenReturn(userDto);

        UserDto result = usersService.replaceUser("test@gmail.com", updatedDto);
        assertNotNull(result);
    }
}
