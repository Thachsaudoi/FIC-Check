package com.ficcheck.ficcheck.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ficcheck.ficcheck.models.AttendanceRecord;
import com.ficcheck.ficcheck.repositories.AttendanceRecordRepository;

@Service
public class AttendanceRecordService {
    @Autowired
    private AttendanceRecordRepository attendanceRecordRepo;

    public AttendanceRecord findRecordById(String id){
        Long idLong = Long.parseLong(id);
        return attendanceRecordRepo.findByRid(idLong);
    }
}
