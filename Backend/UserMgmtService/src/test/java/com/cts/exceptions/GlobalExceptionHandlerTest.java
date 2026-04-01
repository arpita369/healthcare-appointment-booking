package com.cts.exceptions;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

	private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

	@Test
	void testHandleResourceNotFound() {
		ResourceNotFoundException ex = new ResourceNotFoundException("Doctor not found");
		ResponseEntity<String> response = handler.handleResourceNotFound(ex);

		assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
		assertEquals("Doctor not found", response.getBody());
	}

	@Test
	void testHandleGeneralException() {
		Exception ex = new Exception("Something went wrong");
		ResponseEntity<String> response = handler.handleGeneralException(ex);

		assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
		assertEquals("Internal Server Error: Something went wrong", response.getBody());
	}
}