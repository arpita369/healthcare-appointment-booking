package com.cts.service;

import com.cts.dto.UserDto;
import com.cts.dto.UserInputDto;
import com.cts.dto.UserLoginDto;

public interface UsersService {
    UserDto registerUser(UserInputDto userInputDto);
    UserDto loginUser(UserLoginDto userLoginDto);
    boolean isUserValid(String emailId);
    UserDto getUserByEmail(String emailId);
    UserDto replaceUser(String emailId, UserInputDto updatedUser);
    UserDto updateUser(String emailId, UserInputDto updatedUser);
}
