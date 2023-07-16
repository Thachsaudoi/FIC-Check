package com.ficcheck.ficcheck.repositories;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.ficcheck.ficcheck.models.Classroom;
import com.ficcheck.ficcheck.models.AttendanceRecord;

public interface ClassroomRepository extends JpaRepository<Classroom,Long> {
    Classroom findByCid(Long cid);
    Classroom findByJoinCode(String code);
    Long deleteByCid(Long cid);
    @Query("SELECT ar FROM Classroom c JOIN c.attendanceRecords ar WHERE c.cid = :classroomId")
    List<AttendanceRecord> findRecordsByClassroomId(Long classroomId);
}
