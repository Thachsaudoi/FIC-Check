package com.ficcheck.ficcheck.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ficcheck.ficcheck.models.Classroom;

public interface ClassroomRepository extends JpaRepository<Classroom,Long> {
    Classroom findByCid(Long cid);
    Long deleteByCid(Long cid);
}
