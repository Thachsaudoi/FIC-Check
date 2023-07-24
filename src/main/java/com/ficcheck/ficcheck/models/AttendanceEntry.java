package com.ficcheck.ficcheck.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * The AttendanceEntry class represents an entry for a specific attendance record.
 * It contains information about a user's attendance, including the user, attendance record,
 * and seat number.
 */

@Entity
@Table(name ="attendance_entries")
public class AttendanceEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    //Table contains different users with different checked in time and seats
    @ManyToOne
    @JoinColumn(name="user_id", nullable = false)
    private User user;

    //Each classroom has no or multiple records of taking attendance
    //And one record has many entries
    @ManyToOne
    @JoinColumn(name="attendance_record_id", nullable = false)
    private AttendanceRecord attendanceRecord;

    @Column(name="seat", nullable = true)
    private int seatNumber;

    @Column(name="is_checked_in", nullable = false)
    private Boolean isCheckedIn;

    public AttendanceEntry() {
        isCheckedIn = false;
    }

    public AttendanceEntry(AttendanceRecord attendanceRecord, User user, int seatNumber, Boolean isCheckedIn) {
        this.attendanceRecord = attendanceRecord;
        this.user = user;
        this.seatNumber = seatNumber;
        this.isCheckedIn = isCheckedIn;
    }
    public AttendanceEntry(AttendanceRecord attendanceRecord, User user, Boolean isCheckedIn) {
        this.attendanceRecord = attendanceRecord;
        this.user = user;
        this.isCheckedIn = isCheckedIn;
    }

    public Boolean getIsCheckedIn() {
        return isCheckedIn;
    }

    public void setIsCheckedIn(Boolean isCheckedIn) {
        this.isCheckedIn = isCheckedIn;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public AttendanceRecord getAttendanceRecord() {
        return attendanceRecord;
    }

    public void setAttendanceRecord(AttendanceRecord attendanceRecord) {
        this.attendanceRecord = attendanceRecord;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public int getSeatNumber() {
        return seatNumber;
    }

    public void setSeatNumber(int seatNumber) {
        this.seatNumber = seatNumber;
    }
}
