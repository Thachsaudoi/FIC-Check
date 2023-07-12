package com.ficcheck.ficcheck.repositories;
import org.springframework.data.jpa.repository.JpaRepository;

import com.ficcheck.ficcheck.models.AttendanceRecord;
import com.ficcheck.ficcheck.models.Classroom;


public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord,Long>{
}
