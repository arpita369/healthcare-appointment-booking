package com.cts.client;

import com.cts.dto.TokenValidationResponse;
import com.cts.dto.UserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "AUTHSERVICE")
public interface AuthClient {

	@GetMapping("/app1/api/v1/user/validate-token")
    public TokenValidationResponse validateToken(@RequestHeader("Authorization") String authHeader);
    
    @GetMapping("/app1/api/v1/user/{email}")
    UserResponse getUserByEmail(@PathVariable("email") String email, @RequestHeader("Authorization") String authHeader);
}
