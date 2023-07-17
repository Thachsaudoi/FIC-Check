package com.ficcheck.ficcheck.repositories;

import com.ficcheck.ficcheck.models.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.ficcheck.ficcheck.models.User;

import java.time.LocalDateTime;
import java.util.List;

// note that the function inside this class should not be used anymore and should be used the userservice instead.
public interface UserRepository extends JpaRepository<User,Long> {
    User findByuid(Long uid);
    User findByEmail(String email);
    User findByVerificationCode(String code);
    User findByResetPasswordToken(String resetPasswordToken);

    @Query("SELECT u.classrooms FROM User u WHERE u.email = :email")
    List<Classroom> findClassroomsByEmail(String email);
    List<User> findByVerificationCodeExpirationTimeBefore(LocalDateTime now);
    
    @Query("SELECT u FROM User u JOIN u.classrooms c WHERE c.cid = :classroomId")
    List<User> findByClassroomId(Long classroomId);
}
