package com.ficcheck.ficcheck.services;

import java.util.List;

import java.util.Map;

import com.ficcheck.ficcheck.models.User;
import org.springframework.security.crypto.password.PasswordEncoder;


import com.ficcheck.ficcheck.exceptions.UserNotFoundException;
import com.ficcheck.ficcheck.models.User;
// to store all the necessary funcitons
public interface UserService {
    void saveUser(User user);

    void updateResetPasswordToken(String token, String email) throws UserNotFoundException; //  throws UserNotFoundException

    User getByResetPasswordToken(String token);

    Boolean inputIsEmpty(Map<String, String> formData);
    User findUserByEmail(String email);


    void updatePassword(User user, String newPassword);

    
    List<User> getAllUsers();

    Boolean invalidEmail(User user);
    Boolean signUpPasswordNotMatch(String userPassword, String reEnterPassword);
    PasswordEncoder getPasswordEncoder();
    String getHashedId(Long id);

    Boolean invalidPassword(String userPassword);



}

