package com.ficcheck.ficcheck.controllers;

import com.ficcheck.ficcheck.exceptions.UserNotFoundException;
import com.ficcheck.ficcheck.models.User;
import com.ficcheck.ficcheck.services.UserService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.servlet.http.HttpServletRequest;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

import java.io.UnsupportedEncodingException;



import org.springframework.stereotype.Controller;



import org.springframework.web.bind.annotation.ResponseBody;


@Controller
public class ForgotPasswordController {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private UserService userService;


    @PostMapping("/user/forgot_password")
    public String processForgotPassword(HttpServletRequest request, Model model) throws UserNotFoundException {
        String email = request.getParameter("email");
        String token = RandomStringUtils.randomAlphanumeric(30);

        try {
            // the update reset password is not working right
            userService.updateResetPasswordToken(token, email);
            String resetPasswordLink = Utility.getSiteURL(request) +"/user" + "/reset_password?token=" + token;
            sendEmail(email, resetPasswordLink);
            model.addAttribute("message", "We have sent a reset password link to your email. Please check.");

        } catch (UserNotFoundException ex) {
            model.addAttribute("error", ex.getMessage());
            return "user/forgotPassword.html";
        } catch (UnsupportedEncodingException | MessagingException e) {
            model.addAttribute("error", "Error while sending email");
        }

        return "user/confirmation.html";
    }






    public void sendEmail(String recipientEmail, String link)
            throws MessagingException, UnsupportedEncodingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);

        helper.setFrom("contact@ficcheck.com", "FIC-Check Support");
        helper.setTo(recipientEmail);

        String subject = "Here's the link to reset your password";

        String content = "<p>Hello,</p>"
                + "<p>You have requested to reset your password.</p>"
                + "<p>Click the link below to change your password:</p>"
                + "<p><a href=\"" + link + "\">Change my password</a></p>"
                + "<br>"
                + "<p>Ignore this email if you do remember your password, "
                + "or you have not made the request.</p>";

        helper.setSubject(subject);
        helper.setText(content, true);

        mailSender.send(message);
    }

    @GetMapping("/user/reset_password")
    public String showResetPasswordForm(@RequestParam(value = "token") String token, Model model) {
        User user = userService.getByResetPasswordToken(token);
        model.addAttribute("token", token);

        if (user == null) {
            model.addAttribute("message", "Invalid Token");
            return "message";
        }

        return "user/setNewPassword.html";
    }

    @PostMapping("/user/reset_password")

    public String processResetPassword(HttpServletRequest request, Model model) {
        String token = request.getParameter("token");
        String password = request.getParameter("password");
        System.out.println("hello");
        
        User user = userService.getByResetPasswordToken(token);
        model.addAttribute("title", "Reset your password");
        
        if (user == null) {
            model.addAttribute("message", "Invalid Token");
            return "message";
        } else {			
            userService.updatePassword(user, password);
            
            model.addAttribute("message", "You have successfully changed your password.");
        }
        
        return "user/signIn.html";
    }

    public static class Utility {
        public static String getSiteURL(HttpServletRequest request) {
            String siteURL = request.getRequestURL().toString();
            return siteURL.replace(request.getServletPath(), "");
        }
    }
}
