package com.ficcheck.ficcheck.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

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
    private Long rid;

    //One class has multiple records of taking attendance
    @ManyToOne
    @JoinColumn(name = "classroom_id", nullable = false)
    private Classroom classroom;

    //YYYY-MM-DD hh:mm:ss
    @Column(nullable = false, name="attendance_datetime", columnDefinition = "TIMESTAMP")
    private LocalDateTime attendanceDate;

    //One record has multiple entries
    @OneToMany(mappedBy = "attendanceRecord", cascade = CascadeType.ALL)
    private List<AttendanceEntry> attendanceEntries;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "seat_map", columnDefinition = "jsonb")
    private String seatMap; // JSON object representing the seat map, initially set to null

    public AttendanceRecord() {
    }

    public AttendanceRecord(Classroom classroom, LocalDateTime attendanceDate) {
        this.classroom = classroom;
        this.attendanceDate = attendanceDate;
        this.attendanceEntries = new ArrayList<>();
    }

    public Long getRid() {
        return rid;
    }

    public void setRid(Long id) {
        this.rid = id;
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

    public String getSeatMap() {
        return seatMap;
    }

    public void setSeatMap(String seatMap) {
        this.seatMap = seatMap;
    }

}
