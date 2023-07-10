package com.ficcheck.ficcheck.controllers;

import com.ficcheck.ficcheck.models.Classroom;
import com.ficcheck.ficcheck.services.ClassroomService;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.*;
import com.ficcheck.ficcheck.models.User;
import com.ficcheck.ficcheck.services.UserService;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;

@Controller
public class StudentController {
    @Autowired
    private ClassroomService classroomService;
    @Autowired
    private UserService userService;
    
    @GetMapping("/student/dashboard")
    public String getStudentDashboard(Model model, HttpSession session) {
        User user = (User) session.getAttribute("session_user");
        if (user == null ) {
            // Redirect to login page or handle unauthorized access
            return "user/unauthorized.html";
        }
        if (!user.getRole().equals("student")) {
            return "redirect:/user/login";
        }
        model.addAttribute("email", user.getEmail());
        model.addAttribute("name", user.getName());

        // Return the view for the student dashboard
        return "student/dashboard";
    }

}