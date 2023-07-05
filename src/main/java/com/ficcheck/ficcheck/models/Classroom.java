package com.ficcheck.ficcheck.models;

import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "classrooms")
public class Classroom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cid;

    private String roomNumber;
    
    private String className;

    private Long attendanceTaken;
    @ManyToMany
    @JoinTable(name = "user_classroom",
            joinColumns = @JoinColumn(name = "classroom_id", referencedColumnName = "cid"),
            inverseJoinColumns = @JoinColumn(name = "user_id", referencedColumnName = "uid"))
    private List<User> users;

    public Classroom() {
    }

    public Classroom(Long id, String roomNumber, String className, Long attendanceTaken) {
        this.cid = id;
        this.roomNumber = roomNumber;
        this.className = className;
        this.attendanceTaken = attendanceTaken;
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

    public Long getAttendanceTaken() {
        return attendanceTaken;
    }

    public void setAttendanceTaken(Long attendanceTaken) {
        this.attendanceTaken = attendanceTaken;
    }

    public List<User> getUsers() {
        return users;
    }
}
