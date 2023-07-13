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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@Controller
public class TeacherController {
    @Autowired
    private ClassroomService classroomService;
    @Autowired
    private UserService userService;


    @GetMapping("/teacher/dashboard")
    public String getTeacherDashboard(Model model, HttpSession session) {
        User user = (User) session.getAttribute("session_user");
        if (user == null) {
            return "redirect:/user/login";

        }
        if (classroomService.invalidRoleAccess(user)) {
            // Redirect to login page or handle unauthorized access
            return "user/unauthorized.html";
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
        
        String[] rooms = classroomService.getAVAILABLEROOMS();
        model.addAttribute("availableRoomNumbers", rooms);

        // Return the view for the teacher dashboard
        return "teacher/dashboard.html";
    }


    // @GetMapping("/teacher/addClassroom")
    // public String getAddClassroom(HttpSession session, Model model) {
    //     User user = (User) session.getAttribute("session_user");
    //     if (classroomService.invalidRoleAccess(user)) {
    //         // Redirect to login page or handle unauthorized access
    //         return "redirect:/user/login";
    //     }
    //     String[] rooms = classroomService.getAVAILABLEROOMS();
    //     model.addAttribute("availableRoomNumbers", rooms);
    //     return "teacher/dashboard.html";
    // }


    @PostMapping("/teacher/createClassroom")
    public String createClassroom(@RequestParam() Map<String, String> formData,
                                  HttpSession session,
                                  Model model) {
        User user = (User) session.getAttribute("session_user");
        if (classroomService.invalidRoleAccess(user)) {
            // Redirect to login page or handle unauthorized access
            return "redirect:/user/login";
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

    @PostMapping("/teacher/edit/course")
    public String editCourse(@RequestParam Map<String, String> editedForm,
                             HttpSession session) {

        User sessionUser = (User) session.getAttribute("session_user");
        if (sessionUser == null) {
            // Redirect to login page or handle unauthorized access
            return "redirect:/user/login";
        }
        if (classroomService.invalidRoleAccess(sessionUser)) {
            return "user/unauthorized.html";
        }
        String hashedCid = editedForm.get("hashedCid");
        Long classroomId = classroomService.decodeClassId(hashedCid);
        Classroom classroom = classroomService.findClassById(classroomId);

        String className = editedForm.get("classroomName");
        String roomNumber = editedForm.get("roomNumber");

        classroom.setClassName(className);
        classroom.setRoomNumber(roomNumber);
        classroomService.saveClassroom(classroom);
        return "redirect:/teacher/dashboard";
    }

    @PostMapping("/teacher/edit/deleteCourse")
    public String deleteCourse(@RequestParam("hashedCid") String hashedCid,
                                HttpSession session) {
        User sessionUser = (User) session.getAttribute("session_user");
        if (sessionUser == null) {
            // Redirect to login page or handle unauthorized access
            return "redirect:/user/login";
        }

        if (classroomService.invalidRoleAccess(sessionUser)) {
            return "user/unauthorized.html";
        }
        Long classroomId = classroomService.decodeClassId(hashedCid);
        classroomService.deleteClassById(classroomId);
        return "redirect:/teacher/dashboard";
    }


}