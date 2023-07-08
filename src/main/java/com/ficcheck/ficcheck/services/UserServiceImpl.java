package com.ficcheck.ficcheck.services;
import java.io.UnsupportedEncodingException;
import java.util.List;
import java.util.Map;

import com.ficcheck.ficcheck.models.Classroom;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ficcheck.ficcheck.exceptions.UserNotFoundException;
import com.ficcheck.ficcheck.models.User;
import com.ficcheck.ficcheck.repositories.UserRepository;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JavaMailSender mailSender;

    //Salt is just a random set of characters that the hasho algorithm rely on
    //Hashids(salt, minimum hash length)
    private Hashids idHasher = new Hashids("userSALT1234@!$!!!", 6);


     public UserServiceImpl(UserRepository userRepository,
                            PasswordEncoder passwordEncoder) {
         this.userRepository = userRepository;
         this.passwordEncoder = passwordEncoder;
     }


    public Boolean invalidEmail(User user) {
         User existingUser = this.findUserByEmail(user.getEmail());
         
         //IMPORTANT
         //ADD MORE SECURITY, CHECK IF USER DOES NOT ENTER EMPTY EMAIL
         return (existingUser != null && existingUser.getEmail() != null && !existingUser.getEmail().isEmpty());
     }
     public Boolean isNotVerified (User user) {
        User existingUser = this.findUserByEmail(user.getEmail());
        return (existingUser != null && !existingUser.isEnabled());
    }

    public Boolean signUpPasswordNotMatch(String userPassword, String reEnterPassword) {
         /*
            Check once again if user password is not empty and match the confirmed password
            matches(java.lang.CharSequence rawPassword, java.lang.String encodedPassword)
          */
         String encodedUserPassword = this.passwordEncoder.encode(userPassword);
         return !passwordEncoder.matches(reEnterPassword, encodedUserPassword);
     }

    public Boolean invalidPassword(String userPassword) {
         if (userPassword == null || userPassword.isEmpty()) {
             return true; // Password is empty
         }

        if (userPassword.length() < 8) {
            return true; // Password length is less than 8 characters
        }

        boolean containsNumber = false;
        for (char c : userPassword.toCharArray()) {
            if (Character.isDigit(c)) {
                containsNumber = true;
                break;
            }
        }

        return !containsNumber; // Return true if the password does not contain a number
     }


    public Boolean inputIsEmpty(Map<String, String> formData) {
         return formData.keySet().stream().anyMatch(key -> formData.get(key).isEmpty());
     }
    public void saveUser(User user) {
         String encodedPassword = passwordEncoder.encode(user.getPassword());
         user.setPassword(encodedPassword);
         userRepository.save(user);
     }
    public void saveExistingUser(User user) {
         //Save user that is already in database so dont have to decode again
         userRepository.save(user);
     }


    @Override
    public User findUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public String getHashedId(Long id) {
         return this.idHasher.encode(id);
     }
    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }


     @Override
    public void updateResetPasswordToken(String token, String email) throws UserNotFoundException {
        User user = userRepository.findByEmail(email);
        if (user != null) {
            user.setResetPasswordToken(token);
            userRepository.save(user);
        } else {
            throw new UserNotFoundException("Could not find any user with the email " + email);
        }
    }

    @Override
    public User getByResetPasswordToken(String token) {
        return userRepository.findByResetPasswordToken(token);
    }

    @Override
    public void updatePassword(User user, String newPassword) {
        // Assuming you're using BCryptPasswordEncoder
        String encodedPassword = this.passwordEncoder.encode(newPassword);
        user.setPassword(encodedPassword);

        user.setResetPasswordToken(null);
        userRepository.save(user);
    }
    public PasswordEncoder getPasswordEncoder() {
         return this.passwordEncoder;
     }

     public void register(User user, String siteURL)
        throws UnsupportedEncodingException, MessagingException {
         /*
         Register the user through email verification:
         if user NOT in database -> save it in database and send verification
         else only send verification
          */
        User existingUser = this.findUserByEmail(user.getEmail());
        if(existingUser == null) {
            String randomCode = RandomStringUtils.randomAlphanumeric(30);
            user.setVerificationCode(randomCode);
            user.setEnabled(false);
            this.saveUser(user);
            sendVerificationEmail(user, siteURL);
        } else {
            //Get another code if user hit resend, the old code expire
            String randomCode = RandomStringUtils.randomAlphanumeric(30);
            existingUser.setVerificationCode(randomCode);
            userRepository.save(existingUser);
            sendVerificationEmail(existingUser, siteURL);
        }
    }

    @Override
    public void sendVerificationEmail(User user, String siteURL) throws MessagingException, UnsupportedEncodingException {
        String toAddress = user.getEmail();
        String subject = "Please verify your registration";
        String content = "Dear [[name]],<br>"
                + "Please click the link below to verify your registration:<br>"
                + "<h3><a href=\"[[URL]]\" target=\"_self\">VERIFY</a></h3>"
                + "Thank you,<br>"
                + "Your company name.";
        
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);
        
        helper.setFrom("contact@ficcheck.com", "FIC-Check Support");
        helper.setTo(toAddress);
        helper.setSubject(subject);
        
        content = content.replace("[[name]]", user.getName());
        String verifyURL = siteURL + "/verify?code=" + user.getVerificationCode()
                           + "&email=" + user.getEmail();
        
        content = content.replace("[[URL]]", verifyURL);
        
        helper.setText(content, true);
        
        mailSender.send(message);
        
    }
    public boolean verify(String verificationCode, String email) {
         User user = this.findUserByEmail(email);

         if (user != null && !user.isEnabled() && verificationCode.equals(user.getVerificationCode())) {
             user.setVerificationCode(null);
             user.setEnabled(true);
             userRepository.save(user);
             return true;
         }

        return false;
     }

    public List<Classroom> findClassroomsByEmail(String email) {
         return userRepository.findClassroomsByEmail(email);
     }

}

