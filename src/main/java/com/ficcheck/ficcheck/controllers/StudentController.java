package com.ficcheck.ficcheck.controllers;

import com.ficcheck.ficcheck.models.AttendanceEntry;
import com.ficcheck.ficcheck.models.AttendanceRecord;
import com.ficcheck.ficcheck.models.Classroom;
import com.ficcheck.ficcheck.models.StudentClassroom;
import com.ficcheck.ficcheck.services.AttendanceEntryService;
import com.ficcheck.ficcheck.services.AttendanceRecordService;
import com.ficcheck.ficcheck.services.ClassroomService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.*;
import com.ficcheck.ficcheck.models.User;
import com.ficcheck.ficcheck.services.UserService;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;

@Controller
public class StudentController {
    @Autowired
    private ClassroomService classroomService;
    @Autowired
    private UserService userService;
    @Autowired
    private AttendanceRecordService attendanceRecordService;
    @Autowired
    private AttendanceEntryService attendanceEntryService;
    
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
    @ResponseBody
    public ResponseEntity<Map<String, String>> joinRoom(@RequestBody Map<String, String> requestBody, 
                                                        HttpSession session) {
        //Get the code from js post request                                                            
        String code = requestBody.get("roomCode");
        
        Long id = this.classroomService.decodeJoinCode(code);

        Map<String, String> response = new HashMap<>();

        if (id == null) {
            //If cant find class
            response.put("status", "invalidRoom");
        }
        
        String email = (String) session.getAttribute("email");
        Classroom room = classroomService.findClassById(id);

        if (room == null) {
            response.put("status", "invalidRoom");
           return ResponseEntity.ok().body(response);
        }

        User user = userService.findUserByEmail(email);

        if (user != null) {
            List<User> users = classroomService.findUsersByClassroomId(id);

            if (users.contains(user)) {
                response.put("status", "userInClass");
                return ResponseEntity.ok().body(response);
            }

            users.add(user);
            room.setUsers(users);
            classroomService.saveClassroom(room);

            response.put("status", "success");
        } else {
            response.put("status", "unauthorized");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        return ResponseEntity.ok().body(response);
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
            if (user.getUid().equals(sessionUser.getUid())) {
                userInClass = true;
            } 
        }
        if (!userInClass) {
            //In case another student type in the url
            return "user/unauthorized.hmtl";
        }
        Classroom classroom = classroomService.findClassById(classroomId);
        model.addAttribute("usersInClass", usersInClass);
        model.addAttribute("hashedCid", cid);
        model.addAttribute("className", classroom.getClassName());

        Long studentId = userService.decodeUserID(studentHashedId);
        User student = userService.findByUid(studentId);
        model.addAttribute("student", student);
        model.addAttribute("isLive", classroom.getIsLive());

        return "student/attendanceTaking.html";
    }

    @GetMapping("/student/{studentHashedId}/courseInformation/{classroomHashedId}")
    public String getStudentCourseInformation( @PathVariable("classroomHashedId") String cid, 
                                    @PathVariable("studentHashedId") String studentHashedId,
                                        HttpSession session,
                                        Model model) {
        // Use the value of cid for further processing
        // ...
        User sessionUser = (User) session.getAttribute("session_user");
           
        if (sessionUser == null) {
            // Redirect to login page or handle unauthorized access
            return "redirect:/user/login";
        }
        
      
        Long classroomId = classroomService.decodeClassId(cid);
        List<AttendanceRecord> records = attendanceRecordService.findRecordsByClassroomId(classroomId);
        List<AttendanceEntry> entries = new ArrayList<>();
        List<LocalDateTime> attendanceDates =new ArrayList<>();
        int checkedInTime =0;

        for ( AttendanceRecord record: records){
            
            AttendanceEntry entry = attendanceEntryService.findUserEntryInClass(record.getRid(), sessionUser.getUid());
            
            if ( entry != null){
                entries.add(entry);
                attendanceDates.add(record.getAttendanceDate());
                if (entry.getIsCheckedIn()){
                    checkedInTime++;
                }
            }
        }
        Classroom classroom = classroomService.findClassById(classroomId);
        int totalAttendance = classroom.getAttendanceTaken();
        

        
        double   formattedPercentage = (double) checkedInTime / totalAttendance;
        double percentage = Math.round(formattedPercentage * 100.0);
        
        int missedAttendance = totalAttendance - checkedInTime;

        model.addAttribute("hashedCid", cid);
        model.addAttribute("className", classroom.getClassName());
        model.addAttribute("percentage", percentage);
        model.addAttribute("attendanceEntries", entries);
        model.addAttribute("totalAttendance", totalAttendance);
        model.addAttribute("checkedInTimes", checkedInTime);
        model.addAttribute("missedAttendance", missedAttendance);
        model.addAttribute("attendanceDates", attendanceDates);



        return "student/viewData.html";
    }
    
}