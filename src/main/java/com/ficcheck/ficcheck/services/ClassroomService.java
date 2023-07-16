package com.ficcheck.ficcheck.services;

import com.ficcheck.ficcheck.models.AttendanceRecord;
import com.ficcheck.ficcheck.models.Classroom;
import com.ficcheck.ficcheck.models.User;
import com.ficcheck.ficcheck.repositories.ClassroomRepository;

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
        return Long.parseLong(idHasher.decodeHex(id));
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


    public void saveNewAttendance(LocalDateTime now, Classroom classroom) {
        /*
         * When teacher starts taking attendance, save dates and add 1 to attendanceTaken
         */
        AttendanceRecord attendanceRecord = new AttendanceRecord(classroom, now);
        classroom.getAttendanceRecords().add(attendanceRecord);

        int newAttendanceTaken = classroom.getAttendanceTaken() + 1;
        classroom.setAttendanceTaken(newAttendanceTaken);
        this.saveClassroom(classroom);
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

}