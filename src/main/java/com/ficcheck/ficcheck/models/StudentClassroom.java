package com.ficcheck.ficcheck.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

/*
 * This will store the data related to the student in the classroom
 * attendanceTakenTime count how many times the student take attendance in that class in total
 * WILL EXPAND MORE
 */
@Entity
@Table(name = "student_classroom")
public class StudentClassroom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "classroom_id")
    private Classroom classroom;

    @Column(name = "total_checked_in_time", nullable = false)
    private int totalCheckedInTime;
    public StudentClassroom(){}
    public StudentClassroom(User user, Classroom classroom) {
        this.user = user;
        this.classroom = classroom;
        this.totalCheckedInTime = 0; // Set the totalCheckedInTime to 0 by default
    }

    public Long getUid() {
        return id;
    }

    public void setUid(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Classroom getClassroom() {
        return classroom;
    }

    public void setClassroom(Classroom classroom) {
        this.classroom = classroom;
    }

    public int getTotalCheckedInTime() {
        return totalCheckedInTime;
    }

    public void setTotalCheckedInTime(int totalCheckedInTime) {
        this.totalCheckedInTime = totalCheckedInTime;
    }
}