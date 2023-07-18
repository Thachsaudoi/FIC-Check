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
     model.addAttribute("user", user);
     model.addAttribute("studentHashedId", userService.getHashedId(user.getUid()));
    // Return the view for the student dashboard
    return "student/dashboard";
}



    @PostMapping("/student/join")
    public String joinRoom( HttpServletRequest request, Model model, HttpSession session) {
        String code = request.getParameter("roomCode");
        
        Long id = this.classroomService.decodeJoinCode(code); // get the id
        if (id == null){
            return "/student/joinError.html";
        }
        String email = (String) session.getAttribute("email");
        Classroom room = classroomService.findClassById(id);
        
        
        User user = userService.findUserByEmail(email);
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
    @GetMapping("/student/{studentHashedId}/courseStart/{hashedCid}")
    public String getAttendanceTaking( @PathVariable("hashedCid") String cid, 
                                    @PathVariable("studentHashedId") String studentHashedId,
                                        String code,
                                        HttpSession session,
                                        Model model) {
        // Use the value of cid for further processing
        // ...
        User sessionUser = (User) session.getAttribute("session_user");
           
        if (sessionUser == null) {
            // Redirect to login page or handle unauthorized access
            return "redirect:/user/login";
        }
        
        // if (classroomService.invalidRoleAccess(sessionUser)) {
        //     return "user/unauthorized.html";
        // }
        Long classroomId = classroomService.decodeClassId(cid);
        List<User> usersInClass = classroomService.findUsersByClassroomId(classroomId);

        Boolean userInClass = false;
        for (User user : usersInClass) {
            if (!user.getUid().equals(sessionUser.getUid())) {
                userInClass = true;
            } 
        }
        if (!userInClass) {
            //In case another student type in the url
            return "user/unauthorized.hmtl";
        }
        model.addAttribute("usersInClass", usersInClass);
        model.addAttribute("hashedCid", cid);

        Long studentId = userService.decodeUserID(studentHashedId);
        User student = userService.findByUid(studentId);
        model.addAttribute("student", student);

        return "student/attendanceTaking.html";
    }
    
}