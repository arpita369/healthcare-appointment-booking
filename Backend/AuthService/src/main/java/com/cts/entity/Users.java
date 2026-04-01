package com.cts.entity;

import java.time.LocalDate;

import com.cts.dto.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;


@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Users {
    @Id
    @Column(name = "email_id", nullable = false)
    private String emailId;

    private String password;

    @Enumerated(EnumType.STRING)
    private Role userRole;

    private String name;
    private String dateOfBirth;
    private String gender;
    private String phoneNumber;
    private String address;
    private String avatar;
    private boolean status = true;
    private LocalDate registeredOn = LocalDate.now();
}
