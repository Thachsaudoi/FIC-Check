package com.ficcheck.ficcheck.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;
import com.ficcheck.ficcheck.models.Classroom;
import com.ficcheck.ficcheck.services.ClassroomService;

@RestController
public class ClassroomController {
    @Autowired
    private ClassroomService classroomService;

    @GetMapping("ficcheck/api/classroom/GET/seatMap/{hashedCid}")
    public ResponseEntity<String> getSeatMap(@PathVariable String hashedCid) {
        Long classId = classroomService.decodeClassId(hashedCid);
        Classroom classroom = classroomService.findClassById(classId);
        if (classroom == null) {
            return ResponseEntity.badRequest().body("Invalid GET Request: Invalid Class");
        }
        String seatMap = classroom.getSeatMap();
        if (seatMap != null)
            return ResponseEntity.ok(seatMap);
        else {
            return ResponseEntity.ok("none");
        }
    }

    @PostMapping("ficcheck/api/classroom/POST/seatMap/{hashedCid}")
    public ResponseEntity<String> updateSeatMap(@PathVariable String hashedCid, @RequestBody JsonNode seatMap) {
        Long classId = classroomService.decodeClassId(hashedCid);
        Classroom classroom = classroomService.findClassById(classId);

        if (classroom == null) {
            return ResponseEntity.badRequest().body("Invalid Post Request: Invalid CLass");
        }
        classroom.setSeatMap(seatMap.toString());
        classroomService.saveClassroom(classroom);
        return ResponseEntity.ok("Seat map updated successfully");
    }
}
