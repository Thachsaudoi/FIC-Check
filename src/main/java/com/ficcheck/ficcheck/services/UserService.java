package com.ficcheck.ficcheck.services;

import java.io.UnsupportedEncodingException;
import java.util.List;
import java.util.Map;

import com.ficcheck.ficcheck.models.Classroom;
import com.ficcheck.ficcheck.models.User;

import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.ficcheck.ficcheck.exceptions.UserNotFoundException;

// to store all the necessary funcitons
public interface UserService {
    void saveUser(User user);
    void saveExistingUser(User user);
    void updateResetPasswordToken(String token, String email) throws UserNotFoundException; //  throws UserNotFoundException


    Boolean unauthorizedSession(HttpSession session, User sessionUser);
    Boolean inputIsEmpty(Map<String, String> formData);


    void updatePassword(User user, String newPassword);
    

    Boolean signUpPasswordNotMatch(String userPassword, String reEnterPassword);
    PasswordEncoder getPasswordEncoder();
    String getHashedId(Long id);

    Boolean invalidPassword(String userPassword);
    void register(User user, String siteURL) throws UnsupportedEncodingException, MessagingException;      
    void sendVerificationEmail(User user, String siteURL) throws MessagingException, UnsupportedEncodingException;
    boolean verify(String verificationCode, String email);
    User findUserByEmail(String email);
    User getByResetPasswordToken(String token);
    List<Classroom> findClassroomsByEmail(String email);
    List<User> getAllUsers();
    Long decodeUserID(String id);
    List<User> findByClassroomId(Long cid);
    User findByUid(Long uid);
}

