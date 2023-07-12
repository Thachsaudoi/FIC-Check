package com.ficcheck.ficcheck.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * The AttendanceRecord class represents the attendance records
 * for a specific classroom on different dates.
 * It contains information about the classroom, 
 * attendance date, 
 * and a list of attendance entries.
 */

@Entity
@Table(name = "attendance_records")
public class AttendanceRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //One class has multiple records of taking attendance
    @ManyToOne
    @JoinColumn(name = "classroom_id", nullable = false)
    private Classroom classroom;

    //YYYY-MM-DD hh:mm:ss
    @Column(nullable = false, name="attendance_datetime", columnDefinition = "TIMESTAMP")
    private LocalDateTime attendanceDate;

    //One record has multiple entries
    @OneToMany(mappedBy = "attendanceRecord", cascade = CascadeType.ALL)
    private List<AttendanceEntry> attendanceEntries = new ArrayList<>();

    public AttendanceRecord() {
    }

    public AttendanceRecord(Classroom classroom, LocalDateTime attendanceDate) {
        this.classroom = classroom;
        this.attendanceDate = attendanceDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Classroom getClassroom() {
        return classroom;
    }

    public void setClassroom(Classroom classroom) {
        this.classroom = classroom;
    }

    public LocalDateTime getAttendanceDate() {
        return attendanceDate;
    }

    public void setAttendanceDate(LocalDateTime attendanceDate) {
        this.attendanceDate = attendanceDate;
    }

    public List<AttendanceEntry> getAttendanceEntries() {
        return attendanceEntries;
    }

    public void setAttendanceEntries(List<AttendanceEntry> attendanceEntries) {
        this.attendanceEntries = attendanceEntries;
    }

    public void addAttendanceEntry(AttendanceEntry attendance) {
        attendanceEntries.add(attendance);
        attendance.setAttendanceRecord(this);
    }
}
