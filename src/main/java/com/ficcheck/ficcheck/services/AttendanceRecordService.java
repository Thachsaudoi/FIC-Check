package com.ficcheck.ficcheck.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ficcheck.ficcheck.models.AttendanceRecord;
import com.ficcheck.ficcheck.repositories.AttendanceRecordRepository;
import com.ficcheck.ficcheck.repositories.ClassroomRepository;

@Service
public class AttendanceRecordService {
    @Autowired
    private AttendanceRecordRepository attendanceRecordRepo;
    @Autowired
    private ClassroomRepository classroomRepo;

    public AttendanceRecord findRecordById(String id){
        Long idLong = Long.parseLong(id);
        return attendanceRecordRepo.findByRid(idLong);
    }

    public List<AttendanceRecord> findRecordsByClassroomId(Long cid) {
        /*
         * RETURN: List of record
         */
        return classroomRepo.findRecordsByClassroomId(cid);
    }
}
