package com.ficcheck.ficcheck.controllers;

import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.ficcheck.ficcheck.models.User;
import com.ficcheck.ficcheck.services.UserService;

import jakarta.validation.Valid;

import java.io.UnsupportedEncodingException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.servlet.view.RedirectView;

@Controller
public class UserController {
    @Autowired
    private UserService userService;


    @GetMapping("/")
    public RedirectView autoGetLogin() {
        return new RedirectView("/user/login");
        
    }

    @GetMapping("user/register")// TODO: change file name 
    public String getRegister(Model model){
        List<User> users = userService.getAllUsers();
        model.addAttribute("users", users);
        model.addAttribute("user", new User());
        return "user/signUp";
    }
      @PostMapping("/register/save")
    public String processRegister(@RequestParam Map<String, String> formData,
                                @Valid @ModelAttribute("user") User user,
                                BindingResult result, Model model,
                                HttpServletRequest request,
                                HttpSession session) throws UnsupportedEncodingException, MessagingException {
        if (userService.inputIsEmpty(formData)) {
            return "redirect:/user/register?error";
        }
        if (userService.isNotVerified(user)) {
            //Not verified -> pop up message saying there is already an account but not verified
            return "redirect:/user/register?unverifiedEmail";
        }
        if(userService.invalidEmail(user)){
            return "redirect:/user/register?invalidEmail";
        }

        if (userService.signUpPasswordNotMatch(user.getPassword(), formData.get("reEnterPassword"))) {
            result.rejectValue("password", null, "Passwords do not match");
        }
        if (userService.invalidPassword(user.getPassword()))  {
            result.rejectValue("password", null, "Passwords must meet all criterias");
        }

        if(result.hasErrors()){
            model.addAttribute("user", user);
            return "user/signUp";
        }

        userService.register(user, this.getSiteURL(request));
        model.addAttribute("user", user);
        session.setAttribute("verifying_user", user);
        return "redirect:/user/verification/send";

    }

    @GetMapping("/user/verification/send")
    public String getVerification(Model model, HttpSession session) {
        User user = (User) session.getAttribute("verifying_user");
        if (user == null) {
            // Handle the case when the user is not available in the session
            return "redirect:/user/login";
        }

        // Pass the user object to the template
        model.addAttribute("user", user);
        return "user/registerSucceed";
    }

    @PostMapping("/user/verification/reSend")
    public String resendVerificationEmail(HttpSession session,
                                          HttpServletRequest request)
    throws UnsupportedEncodingException, MessagingException{
        User user = (User) session.getAttribute("verifying_user");
        userService.register(user, getSiteURL(request));
        return "redirect:/user/verification/send";
    }


    @GetMapping("/verify")
    public String verifyUser(@Param("code") String code,
                             @Param("email") String email,
                             HttpSession session) {
        if (userService.verify(code, email)) {
            User user = userService.findUserByEmail(email);
            //Create a session with that user and log in immediately, no need sign in
            session.removeAttribute("verifying_user");
            session.setAttribute("session_user", user);
            return this.loginHelper(user);
        }

        return "user/verificationFailed.html";
    }



    private String getSiteURL(HttpServletRequest request) {
        String siteURL = request.getRequestURL().toString();
        return siteURL.replace(request.getServletPath(), "");
    }  

    @GetMapping("/user/login")
    public String getLogin(Model model, HttpServletRequest request, HttpSession session)
    throws UnsupportedEncodingException, MessagingException {
        User user = (User) session.getAttribute("session_user");
        if (user == null) {
            return "user/signIn";
        }
        else {
            model.addAttribute("user", user);
            if (!user.isEnabled()){

                userService.register(user, getSiteURL(request));
                session.setAttribute("verifying_user", user);
                return "redirect:/user/verification/send";
            }
            //Encode id and password
            return this.loginHelper(user);
        }
    }
    public String loginHelper(User user) {
        String hashedUserId = userService.getHashedId(user.getUid());

        if (user.getRole().equals("teacher")) {
            return "redirect:/teacher/dashboard?tid=" + hashedUserId;
        } else if (user.getRole().equals("student")) {
            return "redirect:/student/dashboard?sid=" + hashedUserId;
        } else if (user.getRole().equals("ADMIN")) {
            return "redirect:/admin/dashboard?aid=" + hashedUserId;
        } else {
            return "redirect:/user/login?accessError";
        }
    }

    @PostMapping("/user/login")
    public String login(@RequestParam Map<String, String> formData,
                        Model model,
                        HttpSession session) {
        String email = formData.get("email");
        String password = formData.get("password");

        if (userService.inputIsEmpty(formData)) {
            return "redirect:/user/login?inputError";
        }

        User user = userService.findUserByEmail(email);

        // User not found or wrong password
        PasswordEncoder passwordEncoder = userService.getPasswordEncoder();
        if (user == null || (!passwordEncoder.matches(password, user.getPassword()))){
            // add a model messagnge
            model.addAttribute("error", "No User Found");
            return "redirect:/user/login?error";
        }

        // Successful login attempt
        session.setAttribute("session_user", user);
        model.addAttribute("user", user);
        return "redirect:/user/login";
    }

    @GetMapping("/user/logout")
    public String destroySession(HttpServletRequest request) {
        request.getSession().invalidate();
        return "redirect:/user/login";
    }

    // Kevin forgot password stuff:
    @GetMapping("user/reset")
    public String reset() {
        return "user/forgotPassword";
    }
    @GetMapping("user/forgot_password")
    public String reset2() {
        return "user/forgotPassword";
    }

    //testing seatmap
    @GetMapping("user/seatMap")
    public String testingSeatMap() {
        return "user/seatMap";
    }

}