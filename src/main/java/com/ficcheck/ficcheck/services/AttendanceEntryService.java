package com.ficcheck.ficcheck.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ficcheck.ficcheck.models.AttendanceEntry;
import com.ficcheck.ficcheck.repositories.AttendanceEntryRepository;

@Service
public class AttendanceEntryService {
    @Autowired
    private AttendanceEntryRepository attendanceEntryRepo;

    public AttendanceEntry findEntryById(String id){
        Long idLong = Long.parseLong(id);
        return attendanceEntryRepo.findByid(idLong);
    }
    public void saveAttendanceEntry(AttendanceEntry newEntry){
        this.attendanceEntryRepo.save(newEntry);
    }
}
