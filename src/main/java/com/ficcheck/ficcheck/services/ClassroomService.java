package com.ficcheck.ficcheck.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ficcheck.ficcheck.models.AttendanceEntry;
import com.ficcheck.ficcheck.models.AttendanceRecord;
import com.ficcheck.ficcheck.models.Classroom;
import com.ficcheck.ficcheck.models.User;
import com.ficcheck.ficcheck.repositories.ClassroomRepository;
import com.ficcheck.ficcheck.repositories.UserRepository;

import java.time.LocalDateTime;

import java.util.List;


import com.ficcheck.ficcheck.models.Classroom;
import com.ficcheck.ficcheck.models.User;
import com.ficcheck.ficcheck.repositories.ClassroomRepository;

import jakarta.transaction.Transactional;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ClassroomService {
    @Autowired
    private ClassroomRepository classroomRepo;

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    Hashids idHasher; 
    private String[] AVAILABLEROOMS = {"AQ123","AQ124", "AQ125"};


    public String getHashedJoinCode(Long id) {
        //This will generate the code for the student to put in to join the class
        //Only contain uppercase
        String alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
        idHasher = new Hashids("classroomficcheck@#@!@#&*!!!", 6,alphabet);
        String stringId = Long.toString(id);
        return this.idHasher.encodeHex(stringId);
    }

    public Long decodeJoinCode(String id) {
        //Decode the joincode in classroom
        String alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
        idHasher = new Hashids("classroomficcheck@#@!@#&*!!!", 6,alphabet);
        String result =idHasher.decodeHex(id);
        if ( !result.isBlank()){
            return Long.parseLong(result);
        }
        return null;
    }
    public String getClassHashedId(Long id) {
        //This will generate the hashed id for the class (prob to put in url)
        idHasher = new Hashids("classroomHASHEDID!!!@#@$@!()", 8);
        String stringId = Long.toString(id);
        return this.idHasher.encodeHex(stringId);
    }
    
    public Long decodeClassId(String code) {
        /*
        Return id of the class
        */
        idHasher = new Hashids("classroomHASHEDID!!!@#@$@!()", 8);
        System.out.println("DUMAA" + this.idHasher.decodeHex(code));
        return Long.parseLong(this.idHasher.decodeHex(code));
    }


    public Classroom findClassById(Long id) {
        return this.classroomRepo.findByCid(id);
    }
    

    public void saveClassroom(Classroom classroom) {
        classroomRepo.save(classroom);
    }


    public boolean invalidRoleAccess(User user) {
        return !user.getRole().equals("teacher");
    }


    public String[] getAVAILABLEROOMS()  {
        return this.AVAILABLEROOMS;
    }


    public void saveNewAttendance(LocalDateTime now, 
                                Classroom classroom) {
        /*
         * When teacher starts taking attendance, save dates and add 1 to attendanceTaken
         */
        AttendanceRecord attendanceRecord = new AttendanceRecord(classroom, now);
        classroom.getAttendanceRecords().add(attendanceRecord);
        System.out.println("NEW RECORD ID:");
        System.out.println(attendanceRecord.getRid());
        int newAttendanceTaken = classroom.getAttendanceTaken() + 1;
        classroom.setAttendanceTaken(newAttendanceTaken);
        
        String currentSeatMap = classroom.getCurrentSeatMap();
        System.out.println(currentSeatMap);
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            //Convert the currentseatmap to Json and get the "seats" object
            JsonNode currentSeatMapNode = objectMapper.readTree(currentSeatMap);
            JsonNode seatsObject = currentSeatMapNode.get("seats");


            List<User> students = this.findStudentsByClassroomId(classroom.getCid());
            //Loop through the students in the classroom
            
            for (User student : students) {
                boolean userIsInClass = false;
                Integer seatNumber = null;
    
                // Loop through the currentSeatMapNode and check if the user's email matches
                for (JsonNode seat : seatsObject) {
                    String studentEmail = this.removeQuotes(seat.get("studentEmail").toString()).trim();
                    System.out.println("studentEmail: " +  studentEmail);
                    if (!studentEmail.isEmpty() && studentEmail.equals(student.getEmail())) {
                        //If there is an email then check for the seatNumber
                        userIsInClass = true;
                        String seatNumberStr = this.removeQuotes(seat.get("seatNumber").toString());
                        seatNumber  = Integer.parseInt(seatNumberStr);
                        break;
                        
                    }
                }
                // Set a default value for seatNumber if it remains null
                if (seatNumber == null) {
                    seatNumber = -1; // Or any other appropriate default value
                }
                System.out.println(student.getName());
                System.out.println("hellooooo");
                AttendanceEntry attendanceEntry;
                attendanceEntry = new AttendanceEntry(attendanceRecord, student, seatNumber, userIsInClass);
               
                attendanceRecord.getAttendanceEntries().add(attendanceEntry);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        this.saveClassroom(classroom);
    }

    public String removeQuotes(String input) {
        if (input.startsWith("\"") && input.endsWith("\"")) {
            return input.substring(1, input.length() - 1);
        }
        // Return the input as is if it doesn't start and end with quotes.
        return input;
    }


    public Classroom findClassByRoomCode(String code){
        return this.classroomRepo.findByJoinCode(code);
    }


    @Transactional
    public void deleteClassById(Long cid) {
        classroomRepo.deleteByCid(cid);
    }

    
    public List<AttendanceRecord> findRecordsByClassroomId(Long cid) {
        /*
         * RETURN: List of record
         */
        return classroomRepo.findRecordsByClassroomId(cid);
    }

    public List<User> findUsersByClassroomId(Long cid) {
        return userService.findByClassroomId(cid);
    }
    public boolean isTeacherInClass(Classroom classroom, User user) {
        //Check if the user is the teacher of the class
        List<User> userInClass = this.findUsersByClassroomId(classroom.getCid());
        for (User u : userInClass) {
            if (u.getUid().equals(user.getUid()) && u.getRole().equals("teacher")) {
                return true;
            }
        }
        return false;

    }

    public List<User> findStudentsByClassroomId(Long cid) {
        return userRepository.findStudentsByClassroomId(cid);
    }
}