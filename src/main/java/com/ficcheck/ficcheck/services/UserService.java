package com.ficcheck.ficcheck.services;

import java.io.UnsupportedEncodingException;
import java.util.List;

import java.util.Map;

import com.ficcheck.ficcheck.models.User;

import jakarta.mail.MessagingException;

import org.springframework.data.jpa.repository.Query;
import org.springframework.security.crypto.password.PasswordEncoder;


import com.ficcheck.ficcheck.exceptions.UserNotFoundException;
import com.ficcheck.ficcheck.models.User;
// to store all the necessary funcitons
public interface UserService {
    void saveUser(User user);

    void updateResetPasswordToken(String token, String email) throws UserNotFoundException; //  throws UserNotFoundException

    User getByResetPasswordToken(String token);

    Boolean inputIsEmpty(Map<String, String> formData);


    void updatePassword(User user, String newPassword);

    
    List<User> getAllUsers();

    Boolean invalidEmail(User user);
    Boolean signUpPasswordNotMatch(String userPassword, String reEnterPassword);
    PasswordEncoder getPasswordEncoder();
    String getHashedId(Long id);

    Boolean isNotVerified(User user);
    Boolean invalidPassword(String userPassword);
    void register(User user, String siteURL) throws UnsupportedEncodingException, MessagingException;      
    void sendVerificationEmail(User user, String siteURL) throws MessagingException, UnsupportedEncodingException;
    boolean verify(String verificationCode, String email);
    User findUserByEmail(String email);



}

