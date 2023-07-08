package com.ficcheck.ficcheck.controllers;

import com.ficcheck.ficcheck.models.Classroom;
import com.ficcheck.ficcheck.services.ClassroomService;

import jakarta.servlet.http.HttpServletRequest;
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
        if (user == null || !user.getRole().equals("student")) {
            // Redirect to login page or handle unauthorized access
            return "redirect:/user/login?accessError";
        }
        model.addAttribute("email", user.getEmail());
        model.addAttribute("name", user.getName());

        // Return the view for the student dashboard
        return "student/dashboard";
    }
    @GetMapping("/student/join")
    public String goJoinRoom(){
        return "student/joinClassroom.html";
    }
    @PostMapping("/student/join")
    public String joinRoom(HttpServletRequest request, Model model,HttpSession session){
        String code = request.getParameter("roomCode");
        
        Classroom room = classroomService.findClassById(classroomService.decodeClassId(code));
        if ( room == null){
            return "/student/joinError.html";
        }
        else {
            User user = (User) session.getAttribute("session_user");
            userService.addClassroom(user, room);
        }
        return "student/dashboard";

    }
}