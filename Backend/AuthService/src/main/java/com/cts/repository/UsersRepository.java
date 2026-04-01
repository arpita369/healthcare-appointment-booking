package com.cts.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.cts.entity.Users;

public interface UsersRepository extends JpaRepository<Users, String> {
    boolean existsByEmailId(String emailId);
}