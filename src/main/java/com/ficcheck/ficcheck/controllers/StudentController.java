package com.ficcheck.ficcheck.controllers;

import com.ficcheck.ficcheck.models.Classroom;
import com.ficcheck.ficcheck.services.ClassroomService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.*;
import com.ficcheck.ficcheck.models.User;
import com.ficcheck.ficcheck.services.UserService;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.hibernate.Hibernate;
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
    if (user == null || !user.getRole().equals("student")) {
        // Redirect to login page or handle unauthorized access
        return "redirect:/user/login?accessError";
    }
    
     List<Classroom> classrooms = userService.findClassroomsByEmail(user.getEmail());
    System.out.println("the curent classrooms are : "+ classrooms.size());
    if (classrooms != null) {
        model.addAttribute("classrooms", classrooms);
    } else {
        model.addAttribute("classrooms", Collections.emptyList());
    }
    
    // Add null check for the user object
    if (user != null) {
        model.addAttribute("email", user.getEmail());
        model.addAttribute("name", user.getName());
    }
     session.setAttribute("email", user.getEmail());

    // Return the view for the student dashboard
    return "student/dashboard";
}

    @GetMapping("/student/join")
    public String goJoinRoom(HttpServletRequest request, HttpSession session) {
        // Retrieve the email from the session and add it to the model
        String email = (String) session.getAttribute("email");
        request.setAttribute("email", email);
        
        
        return "student/joinClassroom.html";
    }

    @PostMapping("/student/join")
    public String joinRoom( HttpServletRequest request, Model model, HttpSession session) {
        String code = request.getParameter("roomCode");
        String email = (String) session.getAttribute("email");
        Classroom room = classroomService.findClassByRoomCode(code);
        System.out.println(email);
        System.out.println("The room name is: " + room.getClassName());
        System.out.println("The room name is: " + room.getClassName());
        User user = userService.findUserByEmail(email);
        if (user != null) {
            List<Classroom> classrooms = userService.findClassroomsByEmail(user.getEmail());
            classrooms.add(room);
            user.setClassrooms(classrooms);
            System.out.println("the current mother fukcer is: "+ user.getName());
            userService.saveExistingUser(user);
            System.out.println(user.getClassrooms().toString());
            
        } else {
            // Handle the case when the user does not exist
            // You can redirect to an error page or display an appropriate message
            return "/student/joinError.html";
        }
        return "redirect:/student/dashboard";
    }


    
}