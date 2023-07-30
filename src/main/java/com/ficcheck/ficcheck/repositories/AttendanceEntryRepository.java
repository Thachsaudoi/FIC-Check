package com.ficcheck.ficcheck.repositories;
import org.springframework.data.jpa.repository.JpaRepository;

import com.ficcheck.ficcheck.models.AttendanceEntry;




public interface AttendanceEntryRepository extends JpaRepository<AttendanceEntry,Long>{
    AttendanceEntry findByid(Long id);
     AttendanceEntry findByAttendanceRecord_RidAndUser_Uid(Long rid, Long uid);
}
     