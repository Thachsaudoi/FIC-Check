package com.ficcheck.ficcheck.controllers;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import com.fasterxml.jackson.databind.JsonNode;
import com.ficcheck.ficcheck.models.Classroom;
import com.ficcheck.ficcheck.models.User;
import com.ficcheck.ficcheck.services.ClassroomService;
import jakarta.servlet.http.HttpSession;

@RestController
public class ClassroomController {
    @Autowired
    private ClassroomService classroomService;
    

    @PostMapping("/teacher/course/startAttendance")
    public ResponseEntity<String> startAttendance(@RequestBody Map<String, String> body,
                                                HttpSession session) {
        // ... Existing code ...
        User sessionUser = (User) session.getAttribute("session_user");
        if (sessionUser == null) {
            // Redirect to login page or handle unauthorized access
            return ResponseEntity.badRequest().body("error");
        }

        if (classroomService.invalidRoleAccess(sessionUser)) {
                return ResponseEntity.badRequest().body("unauthorized");
        }
        String hashedCid = body.get("hashedCid");
        String attendanceStatus = body.get("attendanceStatus");
        Long classroomId = classroomService.decodeClassId(hashedCid);
        Classroom classroom = classroomService.findClassById(classroomId);
        classroom.setAttendanceStatus(attendanceStatus.trim());

        classroomService.saveClassroom(classroom);

        return ResponseEntity.ok("success"); 
    }

    @GetMapping("ficcheck/api/classroom/GET/defaultSeatMap/{hashedCid}")
    public ResponseEntity<String> getDefaultSeatMap(@PathVariable String hashedCid, 
                                                    HttpSession session) {
        Long classId = classroomService.decodeClassId(hashedCid);


        Classroom classroom = classroomService.findClassById(classId);
        if (classroom == null) {
            return ResponseEntity.badRequest().body("Invalid GET Request: Invalid Class");
        }

        String DEFAULT_SEATMAP = classroom.getDEFAULT_SEATMAP();

        if (DEFAULT_SEATMAP != null)
            return ResponseEntity.ok(DEFAULT_SEATMAP);
        else {
            return ResponseEntity.ok("none");
        }
    }

    @GetMapping("ficcheck/api/classroom/GET/currentSeatMap/{hashedCid}")
    public ResponseEntity<String> getCurrentSeatMap(@PathVariable String hashedCid,
                                                    HttpSession session) {
        Long classId = classroomService.decodeClassId(hashedCid);
        Classroom classroom = classroomService.findClassById(classId);
        if (classroom == null) {
            return ResponseEntity.badRequest().body("Invalid GET Request: Invalid Class");
        }

        String seatMap = classroom.getCurrentSeatMap();
        if (seatMap != null)
            return ResponseEntity.ok(seatMap);
        else {
            return ResponseEntity.ok("none");
        }
    }

    @PostMapping("ficcheck/api/classroom/POST/defaultSeatMap/{hashedCid}")
    public ResponseEntity<String> updateDefaultSeatMap(@PathVariable String hashedCid, @RequestBody JsonNode seatMap) {
        Long classId = classroomService.decodeClassId(hashedCid);
        Classroom classroom = classroomService.findClassById(classId);
        if (classroom == null) {
            return ResponseEntity.badRequest().body("Invalid Post Request: Invalid CLass");
        }

        classroom.setDEFAULT_SEATMAP(seatMap.toString());
        //Whenever user post default map they also save the current map to be the default map
        classroom.setCurrentSeatMap(seatMap.toString()); // set the current seat map
        classroomService.saveClassroom(classroom);
        
        return ResponseEntity.ok("Default seat map updated successfully");
    }

    @PostMapping("ficcheck/api/classroom/POST/currentSeatMap/{hashedCid}")
    public ResponseEntity<String> updateCurrentSeatMap(@PathVariable String hashedCid, 
                                                        @RequestBody JsonNode seatMap,
                                                        HttpSession session) {

        Long classId = classroomService.decodeClassId(hashedCid);
        Classroom classroom = classroomService.findClassById(classId);
        
        if (classroom == null) {
            return ResponseEntity.badRequest().body("Invalid Post Request: Invalid CLass");
        }
        User sessionUser = (User) session.getAttribute("session_user");
        if (!classroom.getAttendanceStatus().equals("live") && !classroomService.isTeacherInClass(classroom, sessionUser)) {
            return ResponseEntity.badRequest().body("overOrNotStarted");
        }

        
        classroom.setCurrentSeatMap(seatMap.toString());
        classroomService.saveClassroom(classroom);
        return ResponseEntity.ok("Live seat map updated successfully");
    }

    @PostMapping("ficcheck/api/classroom/POST/attendanceRecord/{hashedCid}")
    public ResponseEntity<String> updateAttendanceRecord(@PathVariable String hashedCid,
                                                    
                                                        HttpSession session) {
                                                            // this is when you click saveButton
        
        Long classId = classroomService.decodeClassId(hashedCid);
        Classroom classroom = classroomService.findClassById(classId);
        User sessionUser = (User) session.getAttribute("session_user");
        
        if (classroom == null || sessionUser == null) {
            return ResponseEntity.badRequest().body("error");
        }
        if (!classroomService.isTeacherInClass(classroom, sessionUser)) {
            return ResponseEntity.badRequest().body("error");
        }
         
        //Format the date time that the teacher takes attendance
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        //Format to String then parse back to LocalDateTime data type
        String formattedDateTime = LocalDateTime.now().format(formatter);
        LocalDateTime savedFormattedDateTime = LocalDateTime.parse(formattedDateTime, formatter);
        
        classroomService.saveNewAttendance(savedFormattedDateTime, classroom);
        return ResponseEntity.ok().body("success");
    }

    @PostMapping("/ficcheck/api/classroom/POST/clearSeatMap")
    public ResponseEntity<String> clearOutSeatMap(@RequestBody Map<String, String> body,
                                                        HttpSession session) {
                                                            // this is when you click saveButton
        String hashedCid = body.get("hashedCid");
        System.out.println("DUMAAAA HERE " + hashedCid);
        Long classId = classroomService.decodeClassId(hashedCid);
        Classroom classroom = classroomService.findClassById(classId);
        User sessionUser = (User) session.getAttribute("session_user");
        
        if (classroom == null || sessionUser == null) {
            return ResponseEntity.badRequest().body("error");
        }
        if (!classroomService.isTeacherInClass(classroom, sessionUser)) {
            return ResponseEntity.badRequest().body("error");
        }
         
        classroom.setCurrentSeatMap(classroom.getDEFAULT_SEATMAP());
        classroomService.saveClassroom(classroom);
        return ResponseEntity.ok().body("success");
    }
}
