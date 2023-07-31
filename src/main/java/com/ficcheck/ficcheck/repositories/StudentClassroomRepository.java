package com.ficcheck.ficcheck.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ficcheck.ficcheck.models.StudentClassroom;

public interface StudentClassroomRepository extends JpaRepository<StudentClassroom,Long>{
    @Query("SELECT sc FROM StudentClassroom sc WHERE sc.user.uid = :userId AND sc.classroom.cid = :classroomId")
    StudentClassroom findByUserIdAndClassroomId(@Param("userId") Long userId, @Param("classroomId") Long classroomId);
}
