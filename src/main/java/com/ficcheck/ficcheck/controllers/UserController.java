package com.ficcheck.ficcheck.controllers;

import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.ficcheck.ficcheck.models.User;
import com.ficcheck.ficcheck.services.UserService;

import java.io.UnsupportedEncodingException;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.query.Param;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.servlet.view.RedirectView;

@Controller
public class UserController {
    @Autowired
    private UserService userService;


    @GetMapping("/")
    public RedirectView autoGetLogin() {
        return new RedirectView("/user/login");
        
    }

    /* -------------------- REGISTER -------------------- */
    @GetMapping("user/register")// TODO: change file name 
    public String getRegister(Model model){
        List<User> users = userService.getAllUsers();
        model.addAttribute("users", users);
        model.addAttribute("user", new User());
        return "user/signUp";
    }

    @PostMapping("/register/save")
    @ResponseBody
    public ResponseEntity<String> processRegister(@RequestBody Map<String, String> body,
                                HttpServletRequest request,
                                HttpSession session) throws UnsupportedEncodingException, MessagingException {
         
        if (userService.inputIsEmpty(body)) {
            return ResponseEntity.ok().body("inputIsEmpty");
        }
        String name = body.get("username");
        String email = body.get("email").toLowerCase().trim();
        String password = body.get("password");
        String reEnterPassword = body.get("reEnterPassword");
        String role = body.get("role");

        if (userService.signUpPasswordNotMatch(password, reEnterPassword)) {
            return ResponseEntity.ok().body("passwordNotMatch");
        }
        if (userService.invalidPassword(password))  {
            return ResponseEntity.ok().body("invalidPassword");
        }

        User existingUser = userService.findUserByEmail(email);
        //If use is in database
        if (existingUser != null) {
            if (!existingUser.isEnabled()) {
                // Not verified -> pop up message saying there is already an account but not verified
                return ResponseEntity.ok().body("isNotVerified");
            } else {
                return ResponseEntity.ok().body("invalidEmail");
            }
        }

        //If user is not in database
        User newUser = new User(name, reEnterPassword, email, role);
        userService.register(newUser, this.getSiteURL(request));
        session.setAttribute("verifying_user", newUser);
        // /user/verification/send
        return ResponseEntity.ok().body("success");
    }

    /* -------------------- SIGN UP VERIFICATION -------------------- */
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

    /* -------------------- SIGN IN -------------------- */
    @GetMapping("/user/login")
    public String getLogin(Model model, HttpServletRequest request, HttpSession session)
    throws UnsupportedEncodingException, MessagingException {
        User user = (User) session.getAttribute("session_user");
        if (user == null) {
            return "user/signIn.html";
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

    @PostMapping("/user/POST/login/")
    @ResponseBody
    public ResponseEntity<String> login(@RequestBody Map<String, String> form,
                                        HttpSession session) {      
        if (userService.inputIsEmpty(form)) {
            return ResponseEntity.ok().body("emptyInput");
        }
        String email = form.get("email");
        String password = form.get("password");

        
        email = email.trim().toLowerCase();
        User user = userService.findUserByEmail(email);

        // User not found or wrong password
        PasswordEncoder passwordEncoder = userService.getPasswordEncoder();
        if (user == null || (!passwordEncoder.matches(password, user.getPassword()))){
            // add a model messagnge
            return ResponseEntity.ok().body("invalidAuth");
        }

        // Successful login attempt
        session.setAttribute("session_user", user);
        return ResponseEntity.ok().body("success");
    }

    /* -------------------- LOG OUT -------------------- */

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
    @GetMapping("user/seatMap")
    public String testingSeatMap() {
        return "user/seatMap";
    }



}