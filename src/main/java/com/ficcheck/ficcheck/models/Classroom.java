package com.ficcheck.ficcheck.models;

import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.JdbcType;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.Type;
import org.hibernate.type.SqlTypes;

import com.fasterxml.jackson.databind.JsonNode;

import jakarta.persistence.*;

@Entity
@Table(name = "classrooms")
public class Classroom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cid;
    @Column(nullable = false)
    private String roomNumber;
    @Column(nullable = false)
    private String className;

    private String joinCode;
    private Integer attendanceTaken = 0;

    @ManyToMany
    @JoinTable(name = "user_classroom",
            joinColumns = @JoinColumn(name = "classroom_id", referencedColumnName = "cid"),
            inverseJoinColumns = @JoinColumn(name = "user_id", referencedColumnName = "uid"))
    private List<User> users;

    @OneToMany(mappedBy = "classroom", cascade = CascadeType.ALL)
    private List<AttendanceRecord> attendanceRecords = new ArrayList<>();
    
    //For postgres this sql types is JSONB 
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "seat_map", columnDefinition = "jsonb")
    private String seatMap; // JSON object representing the seat map, initially set to null
    @Column(name = "is_live", nullable = false)
    private Boolean isLive;


    public Classroom() {
        users = new ArrayList<>();
        seatMap = null;
        isLive = false;
    }

    @Transient
    //Transient means that it would not save this variable to the database
    private String hashedId;

    public Classroom(Long id,
                     String roomNumber,
                     String className,
                     Integer attendanceTaken,
                     List<User> users) {
        this.cid = id;
        this.roomNumber = roomNumber;
        this.className = className;
        this.attendanceTaken = attendanceTaken;
        this.users = users;
        this.isLive =false;
    }

    public String getHashedId() {
        return hashedId;
    }

    public void setHashedId(String hashedId) {
        this.hashedId = hashedId;
    }
    public void setJoinCode(String code) {
        this.joinCode = code;
    }
    public String getJoinCode() {
        return joinCode;
    }

    public Long getCid() {
        return cid;
    }

    public void setCid(Long id) {
        this.cid = id;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }


    public Integer getAttendanceTaken() {
        return attendanceTaken;
    }

    public void setAttendanceTaken(Integer attendanceTaken) {

        this.attendanceTaken = attendanceTaken;
    }

    public List<User> getUsers() {
        return users;
    }
    public List<AttendanceRecord> getAttendanceRecords() {
        return attendanceRecords;
    }

    public void setAttendanceRecords(List<AttendanceRecord> attendanceRecords) {
        this.attendanceRecords = attendanceRecords;
    }

    public void setUsers(List<User> users) {
        this.users = users;
    }

    public String getSeatMap() {
        return seatMap;
    }

    public void setSeatMap(String seatMap) {
        this.seatMap = seatMap;
    }

    public Boolean getIsLive() {
        return isLive;
    }

    public void setIsLive(Boolean isLive) {
        this.isLive = isLive;
    }

}
