package com.cts.mapper;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import com.cts.dto.AppointmentDTO;
import com.cts.dto.AppointmentResponseDTO;
import com.cts.entity.Appointment;

@Component
public class AppointmentMapper {

    private ModelMapper modelMapper;

    public AppointmentMapper(ModelMapper modelMapper) {
		this.modelMapper = modelMapper;
	}

	public Appointment toEntity(AppointmentDTO dto) {
        return modelMapper.map(dto, Appointment.class);
    }

    public AppointmentResponseDTO toResponseDTO(Appointment entity) {
        return modelMapper.map(entity, AppointmentResponseDTO.class);
    }
}