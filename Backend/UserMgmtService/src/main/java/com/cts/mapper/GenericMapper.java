package com.cts.mapper;

public interface GenericMapper<D, E> {
	E toEntity(D dto);

	D toDTO(E entity);
}
