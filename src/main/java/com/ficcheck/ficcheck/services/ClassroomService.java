package com.ficcheck.ficcheck.services;

import com.ficcheck.ficcheck.exceptions.UserNotFoundException;
import com.ficcheck.ficcheck.models.Classroom;
import com.ficcheck.ficcheck.models.User;
import com.ficcheck.ficcheck.repositories.ClassroomRepository;
import java.util.Arrays;

import java.util.List;

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

    public boolean invalidSessionAccess(User user) {
        return user == null || !user.getRole().equals("teacher");
    }
    public String[] getAVAILABLEROOMS()  {
        return this.AVAILABLEROOMS;
    }
    public Classroom findClassByRoomCode(String code){
        return this.classroomRepo.findByJoinCode(code);
    }

}