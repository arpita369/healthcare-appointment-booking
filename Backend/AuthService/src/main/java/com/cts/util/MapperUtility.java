package com.cts.util;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import com.cts.dto.UserDto;
import com.cts.dto.UserInputDto;
import com.cts.entity.Users;

@Component
public class MapperUtility {
    private final ModelMapper mapper;

    public MapperUtility(ModelMapper mapper) {
        this.mapper = mapper;
    }

    public Users convertToEntity(UserInputDto userInputDto) {
        Users user = mapper.map(userInputDto, Users.class);
        user.setRegisteredOn(LocalDate.now());
        return user;
    }

    public UserDto convertToDto(Users user) {
        return mapper.map(user, UserDto.class);
    }

    public List<UserDto> convertToDto(List<Users> users) {
        return users.stream()
                .map(user -> mapper.map(user, UserDto.class))
                .collect(Collectors.toList());
    }
}
