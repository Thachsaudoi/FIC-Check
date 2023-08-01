package com.ficcheck.ficcheck.controllers;

import com.ficcheck.ficcheck.exceptions.UserNotFoundException;
import com.ficcheck.ficcheck.models.User;
import com.ficcheck.ficcheck.services.UserService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import jakarta.servlet.http.HttpServletRequest;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
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
    MimeMessageHelper helper = new MimeMessageHelper(message, true, "utf-8");

    // Set sender and recipient information
    helper.setFrom(new InternetAddress("contact@ficcheck.com", "FIC-Check Support"));
    helper.setTo(recipientEmail);

    // Email subject
    String subject = "🔒 Password Reset Request";

    // Email content in HTML format with the header image
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
        + "<p style=\"font-size: 25px;\">Hello there 👋,</p>"
        + "<p style=\"font-size: 25px;\">We received a request to reset your password.</p>" // Twice as big font size
        + "<p style=\"font-size: 25px;\">No worries, just click the button below to set a new password:</p>"
        + "<a style=\"font-size: 25px;\" href=\"" + link + "\" class=\"button\">Reset Password</a>"
        + "<p style=\"font-size: 25px;\">If you didn't make this request, feel free to ignore this email.</p>" // Twice as big font size
        + "<p style=\"font-size: 25px;\">Best regards,</p>" // Twice as big font size
        + "<p style=\"font-size: 25px;\">FIC-Check Support Team.</p>" // Twice as big font size
        + "</div>"
        + "</body>"
        + "</html>";


    helper.setSubject(subject);
    helper.setText(content, true);

    // Add the logo image as an inline image with the 'appLogo' content ID
    ClassPathResource resource = new ClassPathResource("static/images/fic_logo.svg");
    helper.addInline("appLogo", resource);

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
