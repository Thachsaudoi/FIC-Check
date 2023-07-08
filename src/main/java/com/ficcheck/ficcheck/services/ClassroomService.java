package com.ficcheck.ficcheck.services;

import com.ficcheck.ficcheck.models.Classroom;
import com.ficcheck.ficcheck.repositories.ClassroomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ClassroomService {
    @Autowired
    private ClassroomRepository classroomRepo;
    Hashids idHasher;
    public String getHashedJoinCode(Long id) {
        //This will generate the code for the student to put in to join the class
        //Only contain uppercase
        String alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
        idHasher = new Hashids("classroomficcheck@#@!@#&*!!!", 6,alphabet);
        return this.idHasher.encode(id);
    }
    public String getClassHashedId(Long id) {
        //This will generate the hashed id for the class (prob to put in url)
        idHasher = new Hashids("classroomHASHEDID!!!@#@$@!()", 8);
        return this.idHasher.encode(id);
    }
    
    public Classroom findClassById(Long id) {
        return this.classroomRepo.findByCid(id);
    }
    
    public void saveClassroom(Classroom classroom) {
        classroomRepo.save(classroom);
    }
}