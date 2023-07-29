package com.ficcheck.ficcheck.repositories;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ficcheck.ficcheck.models.AttendanceRecord;




public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord,Long>{
    AttendanceRecord findByRid(Long rid);
}
