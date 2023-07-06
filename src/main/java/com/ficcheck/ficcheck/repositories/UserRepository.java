package com.ficcheck.ficcheck.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.ficcheck.ficcheck.models.User;

// note that the function inside this class should not be used anymore and should be used the userservice instead.
public interface UserRepository extends JpaRepository<User,Long> {
    User findByuid(Long uid);
    User findByEmail(String email);
    User findByVerificationCode(String code);
    User findByResetPasswordToken(String resetPasswordToken);

}
