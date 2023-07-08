package com.ficcheck.ficcheck.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ficcheck.ficcheck.models.Classroom;

public interface ClassroomRepository extends JpaRepository<Classroom,Integer> {
    Classroom findByCid(Long cid);
    Classroom findByJoinCode(String code);
}
