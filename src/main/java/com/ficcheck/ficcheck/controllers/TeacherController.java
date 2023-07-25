package com.ficcheck.ficcheck.controllers;

import com.fasterxml.jackson.annotation.JsonCreator.Mode;
import com.ficcheck.ficcheck.models.AttendanceRecord;
import com.ficcheck.ficcheck.models.Classroom;
import com.ficcheck.ficcheck.services.ClassroomService;

import jakarta.mail.Session;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.*;
import com.ficcheck.ficcheck.models.User;
import com.ficcheck.ficcheck.services.UserService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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
        if (user == null || classroomService.invalidRoleAccess(user)) {
            // Redirect to login page or handle unauthorized access
            return "redirect:/user/login";
        }

        Classroom newClassroom = new Classroom();
        newClassroom.setClassName(formData.get("className"));
        newClassroom.setRoomNumber(formData.get("roomNumber"));
        newClassroom.setIsArchived(false);

        // Add the user to the newClassroom
        newClassroom.getUsers().add(user);
        // Save the newClassroom
        classroomService.saveClassroom(newClassroom);
        //Save the class to get the id then hash it and save it again
        String classJoinCode = classroomService.getHashedJoinCode(newClassroom.getCid());
        newClassroom.setJoinCode(classJoinCode);
        classroomService.saveClassroom(newClassroom);
        System.out.println(classroomService.decodeJoinCode(classJoinCode));

        //Add to the teacher database that they are in the class
        List<Classroom> classrooms = userService.findClassroomsByEmail(user.getEmail());
        classrooms.add(newClassroom);
        user.setClassrooms(classrooms);
        userService.saveExistingUser(user);

        model.addAttribute("hashedTeacherId",userService.getHashedId(user.getUid()));

        return "redirect:/teacher/dashboard";
    }


    @GetMapping("/teacher/{hashedTeacherId}/courseEdit/{courseHashedId}")
    public String getCourseEdit(@PathVariable("hashedTeacherId") String teacherHashedId,
                                @PathVariable("courseHashedId") String classroomHashedId,
                                Model model,
                                HttpSession session) {

        User user = (User) session.getAttribute("session_user");
        if (user == null) {
            // Redirect to login page or handle unauthorized access
            return "redirect:/user/login";
        }
        Long teacherId = userService.decodeUserID(teacherHashedId);
        if (!user.getUid().equals(teacherId)) {
            return "redirect:/user/login";
        }
        if (classroomService.invalidRoleAccess(user)) {
            return "user/unauthorized.html";
        }

        Long classroomId = classroomService.decodeClassId(classroomHashedId);
        Classroom classroom = classroomService.findClassById(classroomId);
        model.addAttribute(classroom);

        String[] rooms = classroomService.getAVAILABLEROOMS();
        model.addAttribute("availableRoomNumbers", rooms);
        model.addAttribute("classroomHashedId", classroomHashedId);
        return "teacher/editClassroom.html";
    }

    @GetMapping("/teacher/{hashedTeacherId}/courseData/{courseHashedId}")
    public String getCourseData(@PathVariable("hashedTeacherId") String teacherHashedId,
                                @PathVariable("courseHashedId") String classroomHashedId,
                                Model model,
                                HttpSession session) {
        User user = (User) session.getAttribute("session_user");
        if (user == null) {
            // Redirect to login page or handle unauthorized access
            return "redirect:/user/login";
        }
        Long teacherId = userService.decodeUserID(teacherHashedId);
        if (!user.getUid().equals(teacherId)) {
            return "redirect:/user/login";
        }
        if (classroomService.invalidRoleAccess(user)) {
            return "user/unauthorized.html";
        }
        Long classroomId = classroomService.decodeClassId(classroomHashedId);
        List<AttendanceRecord> attendanceRecords = classroomService.findRecordsByClassroomId(classroomId);
        model.addAttribute("attendanceRecords", attendanceRecords);
        model.addAttribute("classroomHashedId", classroomHashedId);
        return "teacher/attendanceData.html";
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

    @PostMapping("/teacher/course/startAttendance")
        public String startAttendance(@RequestParam("hashedCid") String hashedCid,
                                    @RequestParam("isLive") Boolean isLive,
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
            Classroom classroom = classroomService.findClassById(classroomId);
            System.out.println("DUMA IS LIVE: ");
            System.out.println(isLive);
            System.out.println(classroom.getIsLive());
            classroom.setIsLive(isLive);

            if (classroom.getIsLive()) {
                //Format the date time that the teacher takes attendance
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
                //Format to String then parse back to LocalDateTime data type
                String formattedDateTime = LocalDateTime.now().format(formatter);
                LocalDateTime savedFormattedDateTime = LocalDateTime.parse(formattedDateTime, formatter);

                classroomService.saveNewAttendance(savedFormattedDateTime, classroom);
            }
            classroomService.saveClassroom(classroom);

            //Ajax takes care
            return "redirect:/teacher/dashboard";
        }
    @GetMapping("/teacher/{teacherHashedId}/courseStart/{hashedCid}")
    public String getAttendanceTaking( @PathVariable("hashedCid") String cid, 
                                    @PathVariable("teacherHashedId") String teacherHashedId,
                                        String code,
                                        HttpSession session,
                                        Model model) {
        // Use the value of cid for further processing
        // ...
        /*
        * THIS IS THE SEAT MAP PAGE
        */
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
        model.addAttribute("usersInClass", usersInClass);
        model.addAttribute("hashedCid", cid);

        Long teacherId = userService.decodeUserID(teacherHashedId);
        User teacher = userService.findByUid(teacherId);
        model.addAttribute("teacher", teacher);
        model.addAttribute("teacherName", teacher.getName());

        Classroom classroom = classroomService.findClassById(classroomId);
        model.addAttribute("classroom", classroom);
        model.addAttribute("classroomIsLive", classroom.getIsLive());
        

        return "teacher/attendanceTaking.html";
    }
        // for the archive
    @PostMapping("/teacher/edit/archive/{courseHashedId}")
    public String setArchiveStatus(@PathVariable("courseHashedId") String classroomHashedId, @RequestParam("isArchived") boolean isArchived) {
        Classroom currentClass = classroomService.findClassById(classroomService.decodeClassId(classroomHashedId));
        currentClass.setIsArchived(isArchived);
        classroomService.saveClassroom(currentClass);
        return "redirect:/teacher/dashboard";
    }




}