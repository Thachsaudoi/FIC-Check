package com.ficcheck.ficcheck.controllers;

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
import com.ficcheck.ficcheck.services.UserService;

import jakarta.servlet.http.HttpSession;

@RestController
public class ClassroomController {
    @Autowired
    private ClassroomService classroomService;
    @Autowired
    private UserService userService;

    @GetMapping("ficcheck/api/classroom/GET/defaultSeatMap/{hashedCid}")
    public ResponseEntity<String> getDefaultSeatMap(@PathVariable String hashedCid, 
                                                    HttpSession session) {
        Long classId = classroomService.decodeClassId(hashedCid);


        Classroom classroom = classroomService.findClassById(classId);
        if (classroom == null) {
            return ResponseEntity.badRequest().body("Invalid GET Request: Invalid Class");
        }

        String DEFAULT_SEATMAP = classroom.getDEFAULT_SEATMAP();
        System.out.println("DUMAA ITS HERE ");

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
        System.out.println("DUMA HERE" + hashedCid);
        Long classId = classroomService.decodeClassId(hashedCid);
        Classroom classroom = classroomService.findClassById(classId);
        if (classroom == null) {
            return ResponseEntity.badRequest().body("Invalid Post Request: Invalid CLass");
        }
        classroom.setDEFAULT_SEATMAP(seatMap.toString());
        classroomService.saveClassroom(classroom);
        
        return ResponseEntity.ok("Default seat map updated successfully");
    }

    @PostMapping("ficcheck/api/classroom/POST/currentSeatMap/{hashedCid}")
    public ResponseEntity<String> updateCurrentSeatMap(@PathVariable String hashedCid, 
                                                        @RequestBody JsonNode seatMap,
                                                        HttpSession session) {

        Long classId = classroomService.decodeClassId(hashedCid);
        Classroom classroom = classroomService.findClassById(classId);
        User sessionUser = (User) session.getAttribute("session_user");
        if (classroom == null) {
            return ResponseEntity.badRequest().body("Invalid Post Request: Invalid CLass");
        }
        
        if (!classroom.getIsLive() && !sessionUser.getRole().equals("teacher")) {

            return ResponseEntity.badRequest().body("overOrNotStarted");
        }
        
        classroom.setCurrentSeatMap(seatMap.toString());
        classroomService.saveClassroom(classroom);
        return ResponseEntity.ok("Live seat map updated successfully");
    }
}
