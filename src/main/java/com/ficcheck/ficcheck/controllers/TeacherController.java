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
public class TeacherController {
    @Autowired
    private ClassroomService classroomService;
    @Autowired
    private UserService userService;
    

    @GetMapping("/teacher/dashboard")
    public String getTeacherDashboard(Model model, HttpSession session) {
        User user = (User) session.getAttribute("session_user");
        if (classroomService.invalidSessionAccess(user)) {
            // Redirect to login page or handle unauthorized access
            return "redirect:/user/login";
        }

        List<Classroom> classrooms = userService.findClassroomsByEmail(user.getEmail());
        for (Classroom classroom : classrooms) {
            String hashedId = classroomService.getClassHashedId(classroom.getCid());
            classroom.setHashedId(hashedId);
        }

        model.addAttribute("classrooms", classrooms);
        model.addAttribute("email", user.getEmail());
        model.addAttribute("name", user.getName());


        String teacherHashedId = userService.getHashedId(user.getUid());
        model.addAttribute("teacherHashedId", teacherHashedId);
        // Return the view for the teacher dashboard
        return "teacher/dashboard.html";
    }


    @GetMapping("/teacher/addClassroom")
    public String getAddClassroom(HttpSession session, Model model) {
        User user = (User) session.getAttribute("session_user");
        if (classroomService.invalidSessionAccess(user)) {
            // Redirect to login page or handle unauthorized access
            return "user/unauthorized.html";
        }
        String[] rooms = classroomService.getAVAILABLEROOMS();
        model.addAttribute("availableRoomNumbers", rooms);
        return "teacher/addClassroom.html";
    }
    
    
    @PostMapping("/teacher/createClassroom")
    public String createClassroom(@RequestParam() Map<String, String> formData,
                                  HttpSession session,
                                  Model model) {
        User user = (User) session.getAttribute("session_user");
        if (classroomService.invalidSessionAccess(user)) {
            // Redirect to login page or handle unauthorized access
            return "user/unauthorized.html";
        }
        
        Classroom newClassroom = new Classroom();
        newClassroom.setClassName(formData.get("className"));
        newClassroom.setRoomNumber(formData.get("roomNumber"));
        
        // Add the user to the newClassroom
        newClassroom.getUsers().add(user);
        // Save the newClassroom
        classroomService.saveClassroom(newClassroom);
        //Save the class to get the id then hash it and save it again
        String classJoinCode = classroomService.getHashedJoinCode(newClassroom.getCid());
        newClassroom.setJoinCode(classJoinCode);
        classroomService.saveClassroom(newClassroom);
        
        //Add to the teacher database that they are in the class
        List<Classroom> classrooms = userService.findClassroomsByEmail(user.getEmail());
        classrooms.add(newClassroom);
        user.setClassrooms(classrooms);
        userService.saveExistingUser(user);

        model.addAttribute("teacherHashedId",userService.getHashedId(user.getUid()));

        return "redirect:/teacher/dashboard";
    }

    @GetMapping("/teacher/{hashedTeacherId}/course/{courseHashedId}")
    public String getCourseEdit(@PathVariable("hashedTeacherId") String teacherHashedId,
                                @PathVariable("courseHashedId") String classroomHashedId,
                                Model model,
                                HttpSession session) {

        User user = (User) session.getAttribute("session_user");
        if (classroomService.invalidSessionAccess(user)) {
            // Redirect to login page or handle unauthorized access
            return "user/unauthorized.html";
        }

        Long teacherId = userService.decodeUserID(teacherHashedId);
        System.out.println("DUMA TEACHER ID: " + teacherId);
        System.out.println(user.getUid());
        if (!teacherId.equals(user.getUid())) {
            return "user/unauthorized.html";
        }

        Long classroomId = classroomService.decodeClassId(classroomHashedId);
        Classroom classroom = classroomService.findClassById(classroomId);
        model.addAttribute(classroom);

        String[] rooms = classroomService.getAVAILABLEROOMS();
        model.addAttribute("availableRoomNumbers", rooms);
        return "teacher/editClassroom.html";
    }


}