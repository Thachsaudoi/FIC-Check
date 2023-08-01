package com.ficcheck.ficcheck.models;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;


@Entity
@Table(name = "Users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long uid;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "reset_password_token")
    private String resetPasswordToken;

    @ManyToMany(mappedBy = "users")
    private List<Classroom> classrooms = new ArrayList<>();

    @Column(nullable = false)
    private String role;

    @Column(name = "verification_code", length = 64)
    private String verificationCode;
     
    private boolean enabled; // this value is to check whether the person is validated.
    private LocalDateTime verificationCodeExpirationTime;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StudentClassroom> studentClassroom = new ArrayList<>();
    
    //Transient means that this is not a database column
    //It is just a normal java variable 
    @Transient
    private int attendanceRate;
    @Transient
    private String hashedUid;

    public String getVerificationCode() {
        return verificationCode;
    }
    public void setVerificationCode(String verificationCode) {
        this.verificationCode = verificationCode;
    }
    public boolean isEnabled() {
        return enabled;
    }
    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
    public User() {
    }
    public User(Long uid, String name, String password, String email, String role) {
        this.uid = uid;
        this.name = name;
        this.password = password;
        this.email = email;
        this.role = role;
    }


    public List<Classroom> getClassrooms() {
        return classrooms;
    }
    public void setClassrooms(List<Classroom> classrooms) {
        this.classrooms = classrooms;
    }
    public String getResetPasswordToken() {
        return resetPasswordToken;
    }
    public void setResetPasswordToken(String resetPasswordToken) {
        this.resetPasswordToken = resetPasswordToken;
    }
    public Long getUid() {
        return uid;
    }
    public void setUid(Long uid) {
        this.uid = uid;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getRole() {
        return role;
    }
    public void setRole(String role) {
        this.role = role;
    }
    public LocalDateTime getVerificationCodeExpirationTime() {
        return verificationCodeExpirationTime;
    }
    public void setVerificationCodeExpirationTime(LocalDateTime verificationCodeExpirationTime) {
        this.verificationCodeExpirationTime = verificationCodeExpirationTime;
    }

    public List<StudentClassroom> getStudentClassroom() {
        return studentClassroom;
    }

    public void setStudentClassroom(List<StudentClassroom> studentClassroom) {
        this.studentClassroom = studentClassroom;
    }

    public int getAttendanceRate() {
        return attendanceRate;
    }

    public void setAttendanceRate(int attendanceRate) {
        this.attendanceRate = attendanceRate;
    }

    public String getHashedUid() {
        return hashedUid;
    }
    
    public void setHashedUid(String hashedUid) {
        this.hashedUid = hashedUid;
    }
    
    
}