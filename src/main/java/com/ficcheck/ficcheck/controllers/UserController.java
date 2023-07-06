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
//        PasswordEncoder passwordEncoder = userService.getPasswordEncoder();
        
    }

    @GetMapping("user/register")// TODO: change file name 
    public String getRegister(Model model){
        List<User> users = userService.getAllUsers();
        model.addAttribute("users", users);
        model.addAttribute("user", new User());
        return "user/signUp";
    }
      @PostMapping("/register/save")
public String processRegister(@RequestParam Map<String, String> formData, @Valid @ModelAttribute("user") User user, BindingResult result, Model model, HttpServletRequest request) throws UnsupportedEncodingException, MessagingException {

        if (userService.inputIsEmpty(formData)) {
            return "redirect:/user/register?error";
        }
        if(userService.invalidEmail(user)){
            // result.rejectValue("email", null,
            //         "There is already an account registered with the same email");
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

        //here i used mark's stuff and added on mine

        userService.register(user, getSiteURL(request));       
        return "user/registerSucceed.html";
    }
     
    private String getSiteURL(HttpServletRequest request) {
        String siteURL = request.getRequestURL().toString();
        return siteURL.replace(request.getServletPath(), "");
    }  
    // @PostMapping("/register/save")
    // public String register(@RequestParam Map<String, String> formData,
    //                        @Valid @ModelAttribute("user") User user,
    //                             BindingResult result,
    //                            Model model){
    //     if (userService.inputIsEmpty(formData)) {
    //         return "redirect:/user/register?error";
    //     }
    //     if(userService.invalidEmail(user)){
    //         result.rejectValue("email", null,
    //                 "There is already an account registered with the same email");
    //     }
    //     if (userService.signUpPasswordNotMatch(user.getPassword(), formData.get("reEnterPassword"))) {
    //         result.rejectValue("password", null, "Passwords do not match");
    //     }
    //     if (userService.invalidPassword(user.getPassword()))  {
    //         result.rejectValue("password", null, "Passwords must meet all criterias");
    //     }

    //     if(result.hasErrors()){
    //         model.addAttribute("user", user);
    //         return "user/signUp";
    //     }

    //     userService.saveUser(user);
    //     return "redirect:/user/register?success";
    // }


    @GetMapping("/user/login")
    public String getLogin(Model model, HttpServletRequest request, HttpSession session) {
        User user = (User) session.getAttribute("session_user");
        if (user == null) {
            return "user/signIn";
        }
        else {
            model.addAttribute("user", user);
            String hashedUserId = userService.getHashedId(user.getUid());
            //Encode id and password
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
    }
    @GetMapping("/student/dashboard")
    public String getStudentDashboard(Model model, HttpSession session) {
        User user = (User) session.getAttribute("session_user");
        if (user == null || !user.getRole().equals("student")) {
            // Redirect to login page or handle unauthorized access
            return "redirect:/user/login?accessError";
        }
        model.addAttribute("email", user.getEmail());
        model.addAttribute("name", user.getName());

        // Return the view for the student dashboard
        return "student/dashboard";
    }

    @GetMapping("/teacher/dashboard")
    public String getTeacherDashboard(Model model, HttpSession session) {
        User user = (User) session.getAttribute("session_user");
        if (user == null || !user.getRole().equals("teacher")) {
            // Redirect to login page or handle unauthorized access
            return "redirect:/user/login";
        }
        model.addAttribute("email", user.getEmail());
        model.addAttribute("name", user.getName());

        // Return the view for the teacher dashboard
        return "teacher/dashboard";
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


    @GetMapping("/verify")
    public String verifyUser(@Param("code") String code) {
        if (userService.verify(code)) {
            return "user/verificationSucceed.html";
        } else {
            return "user/verificationFailed.html";
        }
    }

}
