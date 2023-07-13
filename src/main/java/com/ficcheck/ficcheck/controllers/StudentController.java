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
        return "redirect:/user/login?accessError";
    }
    
     List<Classroom> classrooms = userService.findClassroomsByEmail(user.getEmail());
     for (Classroom classroom : classrooms) {
        String hashedId = classroomService.getClassHashedId(classroom.getCid());
        classroom.setHashedId(hashedId);
    }
    if (classrooms != null) {
        model.addAttribute("classrooms", classrooms);
    } else {
        model.addAttribute("classrooms", Collections.emptyList());
    }

    model.addAttribute("email", user.getEmail());
    model.addAttribute("name", user.getName());
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
        Long id = this.classroomService.decodeJoinCode(code); // get the id
        String email = (String) session.getAttribute("email");
        Classroom room = classroomService.findClassById(id);
        User user = userService.findUserByEmail(email);
        System.out.println("room: id " + room.getCid() );
        System.out.println("user " + user.getUid());
        if (user != null) {
            List<User> users = classroomService.findUsersByClassroomId(id);
            if (users.contains(user)){
                return "/student/joinError.html"; // this is when the person already joined the room
            }
            users.add(user);
            room.setUsers(users);
            classroomService.saveClassroom(room);
        
        } else {
            return "/student/joinError.html";
        }
        return "redirect:/student/dashboard";
    }
    
    
}