package com.ficcheck.ficcheck.services;

import java.io.UnsupportedEncodingException;
import java.util.List;
import java.util.Map;

import com.ficcheck.ficcheck.models.Classroom;
import jakarta.servlet.http.HttpSession;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ficcheck.ficcheck.exceptions.UserNotFoundException;
import com.ficcheck.ficcheck.models.User;
import com.ficcheck.ficcheck.repositories.UserRepository;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import jakarta.transaction.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;



@Service
public class UserServiceImpl implements UserService {
    LocalDateTime now = LocalDateTime.now();
    LocalDateTime expirationTime = now.plus(10, ChronoUnit.MINUTES);
    @Autowired
    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JavaMailSender mailSender;

    //Salt is just a random set of characters that the hasho algorithm rely on
    //Hashids(salt, minimum hash length)
    private Hashids idHasher = new Hashids("userSALT1234@!$!!!", 9);



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

    public Boolean isNotVerified(User user) {
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
        user.setEmail(user.getEmail().toLowerCase());
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
        String stringId = Long.toString(id);
        return this.idHasher.encodeHex(stringId);
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
     public void register(User user, String siteURL) throws UnsupportedEncodingException, MessagingException {
         /*
         Register the user through email verification:
         if user NOT in database -> save it in database and send verification
         else only send verification
          */
        User existingUser = this.findUserByEmail(user.getEmail());
        if (existingUser == null) {
            String randomCode = RandomStringUtils.randomAlphanumeric(30);
            user.setVerificationCode(randomCode);
            user.setEnabled(false);
            user.setVerificationCodeExpirationTime(expirationTime); // Set the expiration time

            this.saveUser(user);
            sendVerificationEmail(user, siteURL);
        } else {
            String randomCode = RandomStringUtils.randomAlphanumeric(30);
            existingUser.setVerificationCode(randomCode);
            existingUser.setVerificationCodeExpirationTime(expirationTime); // Set the expiration time
            userRepository.save(existingUser);
            sendVerificationEmail(existingUser, siteURL);
        }
    }


    @Override
    public void sendVerificationEmail(User user, String siteURL) throws MessagingException, UnsupportedEncodingException {
        String toAddress = user.getEmail();
        String subject = "Please verify your registration";

        // Email content in HTML format with the header image and same styling
        String content = "<html>"
                + "<head>"
                + "<style>"
                + "body { font-family: 'Poppins', Arial, sans-serif; font-size: 18px; line-height: 1.6; margin: 0; padding: 0; }"
                + ".button { background-color: #cc0633; border: none; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; display: inline-block; margin-top: 30px; font-size: 22px; }"
                + ".center { text-align: center; }"
                + ".spacer { margin-bottom: 40px; }" // Add more space between image and text
                + "</style>"
                + "</head>"
                + "<body>"
                + "<div class=\"center spacer\">" // Add the 'spacer' class to create more space
                + "<img src=\"cid:appLogo\" style=\"width: 600px; height: auto; display: block; margin: 0 auto;\">\n" + //
                "</div>"
                +"<p> </p>"
                +"<p> </p>"
                + "<div class=\"center\">" // Keep the 'center' class for the rest of the content
                + "<p style=\"font-size: 25px;\">Dear " + user.getName() + ",</p>"
                + "<p style=\"font-size: 25px;\">Please click the button below to verify your registration:</p>"
                + "<a style=\"font-size: 25px;\" href=\"" + siteURL + "/verify?code=" + user.getVerificationCode()
                + "&email=" + user.getEmail() + "\" class=\"button\">Verify Account</a>"
                + "<p style=\"font-size: 25px;\">Thank you,</p>" // Twice as big font size
                + "<p style=\"font-size: 25px;\">FIC-Check Support Team.</p>" // Twice as big font size
                + "</div>"
                + "</body>"
                + "</html>";

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "utf-8");

        // Set sender and recipient information
        helper.setFrom(new InternetAddress("contact@ficcheck.com", "FIC-Check Support"));
        helper.setTo(toAddress);

        helper.setSubject(subject);
        helper.setText(content, true);

        // Add the logo image as an inline image with the 'appLogo' content ID
        ClassPathResource resource = new ClassPathResource("static/images/fic_logo.svg");
        helper.addInline("appLogo", resource);

        mailSender.send(message);
    }


    public boolean verify(String verificationCode, String email) {
        User user = this.findUserByEmail(email);

        if (user != null && !user.isEnabled() && verificationCode.equals(user.getVerificationCode())) {
            LocalDateTime now = LocalDateTime.now();
            if (user.getVerificationCodeExpirationTime().isAfter(now)) {
                user.setVerificationCode(null);
                user.setEnabled(true);
                userRepository.save(user);
                return true;
            }
        }

        return false;
    }

     @Override
    public List<Classroom> findClassroomsByEmail(String email) {
         return userRepository.findClassroomsByEmail(email);
     }
     @Override
    public Long decodeUserID(String id) {
         return Long.parseLong(this.idHasher.decodeHex(id));
     }
    @Scheduled(fixedDelay = 60000) // Runs every minute 
    @Transactional
    public void cleanupExpiredVerificationCodes() {
        LocalDateTime now = LocalDateTime.now();
        List<User> usersWithExpiredCodes = userRepository.findByVerificationCodeExpirationTimeBefore(now);
        
        for (User user : usersWithExpiredCodes) {
            if ((user.getVerificationCodeExpirationTime().isBefore(now))){
                if (!user.isEnabled()) {
                    userRepository.delete(user);
                }
                else{
                    user.setVerificationCodeExpirationTime(null);
                    userRepository.save(user);
                }
            }

        }
    }


    public Boolean unauthorizedSession(HttpSession session, User sessionUser) {
        /*
        Will add more security function in future
         */
        return sessionUser == null;
    }

    public List<User> findByClassroomId(Long cid) {
        return userRepository.findByClassroomId(cid);
    }

    public User findByUid(Long uid) {
        return userRepository.findByuid(uid);
    }
}   

