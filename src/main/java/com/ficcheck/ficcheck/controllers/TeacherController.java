package com.ficcheck.ficcheck.controllers;

import com.ficcheck.ficcheck.models.AttendanceEntry;
import com.ficcheck.ficcheck.models.AttendanceRecord;
import com.ficcheck.ficcheck.models.Classroom;

import com.ficcheck.ficcheck.models.StudentClassroom;

import com.ficcheck.ficcheck.services.AttendanceEntryService;

import com.ficcheck.ficcheck.services.AttendanceRecordService;
import com.ficcheck.ficcheck.services.ClassroomService;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.*;
import com.ficcheck.ficcheck.models.User;
import com.ficcheck.ficcheck.services.UserService;
import java.util.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;



@Controller
public class TeacherController {
    @Autowired
    private ClassroomService classroomService;
    @Autowired
    private UserService userService;
    @Autowired
    private AttendanceRecordService attendanceRecordService;
    @Autowired
    private AttendanceEntryService attendanceEntryService;

    @GetMapping("/teacher/dashboard")
    public String getTeacherDashboard(Model model, HttpSession session) {
        User user = (User) session.getAttribute("session_user");
        if (user == null) {
            return "redirect:/user/login";

        }
        if (classroomService.invalidRoleAccess(user)) {
            // Redirect to login page or handle unauthorized access
            return "user/unauthorized.html";
        }

        List<Classroom> classrooms = userService.findClassroomsByEmail(user.getEmail());
        for (Classroom classroom : classrooms) {
            String hashedId = classroomService.getClassHashedId(classroom.getCid());
            classroom.setHashedId(hashedId);
        }

        model.addAttribute("classrooms", classrooms);
        model.addAttribute("email", user.getEmail());
        model.addAttribute("name", user.getName());


        String teacherHashedId = userService.getHashedId(user.getUid());
        model.addAttribute("teacherHashedId", teacherHashedId);
        
        String[] rooms = classroomService.getAVAILABLEROOMS();
        model.addAttribute("availableRoomNumbers", rooms);

        // Return the view for the teacher dashboard
        return "teacher/dashboard.html";
    }

    /*
     * -------------- COURSE EDIT - ADD, DELETE, EDIT COURSE --------------
     */


    @PostMapping("/teacher/createClassroom")
    public String createClassroom(@RequestParam() Map<String, String> formData,
                                  HttpSession session,
                                  Model model) {
        User user = (User) session.getAttribute("session_user");
        if (user == null || classroomService.invalidRoleAccess(user)) {
            // Redirect to login page or handle unauthorized access
            return "redirect:/user/login";
        }

        Classroom newClassroom = new Classroom();
        newClassroom.setClassName(formData.get("className"));
        newClassroom.setRoomNumber(formData.get("roomNumber"));
        newClassroom.setIsArchived(false);

        // Add the user to the newClassroom
        newClassroom.getUsers().add(user);
        // Save the newClassroom
        classroomService.saveClassroom(newClassroom);
        //Save the class to get the id then hash it and save it again
        String classJoinCode = classroomService.getHashedJoinCode(newClassroom.getCid());
        newClassroom.setJoinCode(classJoinCode);
        classroomService.saveClassroom(newClassroom);

        //Add to the teacher database that they are in the class
        List<Classroom> classrooms = userService.findClassroomsByEmail(user.getEmail());
        classrooms.add(newClassroom);
        user.setClassrooms(classrooms);
        userService.saveExistingUser(user);

        model.addAttribute("hashedTeacherId",userService.getHashedId(user.getUid()));

        return "redirect:/teacher/dashboard";
    }


    @GetMapping("/teacher/{hashedTeacherId}/courseEdit/{courseHashedId}")
    public String getCourseEdit(@PathVariable("hashedTeacherId") String teacherHashedId,
                                @PathVariable("courseHashedId") String classroomHashedId,
                                Model model,
                                HttpSession session) {

        User user = (User) session.getAttribute("session_user");
        if (user == null) {
            // Redirect to login page or handle unauthorized access
            return "redirect:/user/login";
        }
        Long teacherId = userService.decodeUserID(teacherHashedId);
        if (!user.getUid().equals(teacherId)) {
            return "redirect:/user/login";
        }
        if (classroomService.invalidRoleAccess(user)) {
            return "user/unauthorized.html";
        }

        Long classroomId = classroomService.decodeClassId(classroomHashedId);
        Classroom classroom = classroomService.findClassById(classroomId);
        model.addAttribute(classroom);

        String[] rooms = classroomService.getAVAILABLEROOMS();
        model.addAttribute("availableRoomNumbers", rooms);
        model.addAttribute("classroomHashedId", classroomHashedId);
        return "teacher/editClassroom.html";
    }


    @PostMapping("/teacher/edit/course")
    public String editCourse(@RequestParam Map<String, String> editedForm,
                             HttpSession session) {

        User sessionUser = (User) session.getAttribute("session_user");
        if (sessionUser == null) {
            // Redirect to login page or handle unauthorized access
            return "redirect:/user/login";
        }
        if (classroomService.invalidRoleAccess(sessionUser)) {
            return "user/unauthorized.html";
        }
        String hashedCid = editedForm.get("hashedCid");
        Long classroomId = classroomService.decodeClassId(hashedCid);
        Classroom classroom = classroomService.findClassById(classroomId);

        String className = editedForm.get("classroomName");
        String roomNumber = editedForm.get("roomNumber");

        classroom.setClassName(className);
        classroom.setRoomNumber(roomNumber);
        classroomService.saveClassroom(classroom);
        return "redirect:/teacher/dashboard";
    }

    @PostMapping("/teacher/edit/deleteCourse")
    public String deleteCourse(@RequestParam("hashedCid") String hashedCid,
                                HttpSession session) {
        User sessionUser = (User) session.getAttribute("session_user");
        if (sessionUser == null) {
            // Redirect to login page or handle unauthorized access
            return "redirect:/user/login";
        }

        if (classroomService.invalidRoleAccess(sessionUser)) {
            return "user/unauthorized.html";
        }
        Long classroomId = classroomService.decodeClassId(hashedCid);
        classroomService.deleteClassById(classroomId);
        return "redirect:/teacher/dashboard";
    }


    /*
     * -------------- ATTENDANCE TAKING --------------
     */



    @GetMapping("/teacher/{teacherHashedId}/courseStart/{hashedCid}")
    public String getAttendanceTaking( @PathVariable("hashedCid") String cid, 
                                    @PathVariable("teacherHashedId") String teacherHashedId,
                                        String code,
                                        HttpSession session,
                                        Model model) {
        // Use the value of cid for further processing
        // ...
        /*
        * THIS IS THE SEAT MAP PAGE
        */
        User sessionUser = (User) session.getAttribute("session_user");
        
        if (sessionUser == null) {
            // Redirect to login page or handle unauthorized access
            return "redirect:/user/login";
        }
        // if (classroomService.invalidRoleAccess(sessionUser)) {
        //     return "user/unauthorized.html";
        // }
        Long classroomId = classroomService.decodeClassId(cid);
        List<User> usersInClass = classroomService.findUsersByClassroomId(classroomId);
        model.addAttribute("usersInClass", usersInClass);
        model.addAttribute("hashedCid", cid);


        Long teacherId = userService.decodeUserID(teacherHashedId);
        User teacher = userService.findByUid(teacherId);
        model.addAttribute("teacher", teacher);
        model.addAttribute("teacherName", teacher.getName());

        Classroom classroom = classroomService.findClassById(classroomId);
        model.addAttribute("classroom", classroom);
        model.addAttribute("classroomIsLive", classroom.getAttendanceStatus());

        String joinCode = classroomService.getHashedJoinCode(classroomId);
        model.addAttribute("joinCode", joinCode);
        

        return "teacher/attendanceTaking.html";
    }
        
    @PostMapping("/teacher/edit/archive/{courseHashedId}")
    public String setArchiveStatus(@PathVariable("courseHashedId") String classroomHashedId, 
                                    @RequestParam("isArchived") boolean isArchived, 
                                    HttpSession session) {
        User user = (User) session.getAttribute("session_user");
        if (user == null) {
            // Redirect to login page or handle unauthorized access
            return "redirect:/user/login";
        }
        if (classroomService.invalidRoleAccess(user)) {
            return "user/unauthorized.html";
        }              
        Classroom currentClass = classroomService.findClassById(classroomService.decodeClassId(classroomHashedId));
        currentClass.setIsArchived(isArchived);
        classroomService.saveClassroom(currentClass);
        return "redirect:/teacher/dashboard";
    }



    /*
     * -------------- COURSE DATA - ATTENDANCE RECORDS --------------
     */

    
    @GetMapping("/teacher/{hashedTeacherId}/courseData/{courseHashedId}")
    public String getCourseData(@PathVariable("hashedTeacherId") String teacherHashedId,
                                @PathVariable("courseHashedId") String classroomHashedId,
                                Model model,
                                HttpSession session) {
        /*
        * RETURN: html of attendanceData of a specific class when teacher press viewData
        */
        User user = (User) session.getAttribute("session_user");
        if (user == null) {
            // Redirect to login page or handle unauthorized access
            return "redirect:/user/login";
        }
        Long teacherId = userService.decodeUserID(teacherHashedId);
        if (!user.getUid().equals(teacherId)) {
            return "redirect:/user/login";
        }
        if (classroomService.invalidRoleAccess(user)) {
            return "user/unauthorized.html";
        }
        Long classroomId = classroomService.decodeClassId(classroomHashedId);

        List<AttendanceRecord> attendanceRecords = attendanceRecordService.findRecordsByClassroomId(classroomId);
        // List<User> usersInclass = classroomService.findUsersByClassroomId(classroomId);

        //  model.addAttribute("usersInClass", usersInclass);
        model.addAttribute("attendanceRecords", attendanceRecords);
        model.addAttribute("classroomHashedId", classroomHashedId);
        model.addAttribute("hashedTeacherId", teacherHashedId);
        model.addAttribute("courseHashedId", classroomHashedId);
        model.addAttribute("email", user.getEmail());
        model.addAttribute("name", user.getName());

        Classroom classroom = classroomService.findClassById(classroomId);
        model.addAttribute("classroom", classroom.getClassName());

        int classroomAttendanceTaken = classroom.getAttendanceTaken();
        List<User> students = classroomService.findStudentsByClassroomId(classroomId);
        for (User student : students) {
            //Find that student data by userId and classID
            StudentClassroom studentData = classroomService.findByUserIdAndClassroomId(student.getUid(), classroom.getCid());
            //set hashedUid for deleting the user purpose in html
            String studentHashedUid = userService.getHashedId(student.getUid());
            student.setHashedUid(studentHashedUid);

            if (studentData == null) {
                //If there is not data then set all to 0
                student.setAttendanceRate(0);
                continue;
            }
            int checkedInTime = studentData.getTotalCheckedInTime();
            // Calculate student checked in / class total attendance time
            double percentage = (double) checkedInTime / classroomAttendanceTaken; // Use double for floating-point division

            int attendanceRate = (int) (percentage * 100); // Convert back to integer
            student.setAttendanceRate(attendanceRate);
        }
        model.addAttribute("classroomAttendanceTaken", classroom.getAttendanceTaken());
        model.addAttribute("students", students);
        return "teacher/attendanceData.html";
    }

    @GetMapping("/teacher/{hashedTeacherId}/courseData/{courseHashedId}/{recordId}")
    public String getCourseRecord(@PathVariable("hashedTeacherId") String teacherHashedId,
                                @PathVariable("courseHashedId") String classroomHashedId,
                                @PathVariable("recordId") String recordId,
                                Model model,
                                HttpSession session) {
        /*
         * This method is used to return a page of a single record 
         * which is the page that contains seatmap and table of a specific date
         * @Param recordId: take the recordID and display data based on that records
         */ 
        User user = (User) session.getAttribute("session_user");
        if (user == null) {
            // Redirect to login page or handle unauthorized access
            return "redirect:/user/login";
        }
        Long teacherId = userService.decodeUserID(teacherHashedId);
        if (!user.getUid().equals(teacherId)) {
            return "redirect:/user/login";
        }
        if (classroomService.invalidRoleAccess(user)) {
            return "user/unauthorized.html";
        }
        Long id = classroomService.decodeClassId(classroomHashedId);
        AttendanceRecord attendanceRecord = attendanceRecordService.findRecordById(recordId);   
        model.addAttribute("attendanceRecord", attendanceRecord);
        model.addAttribute("attendanceEntries", attendanceRecord.getAttendanceEntries());
        model.addAttribute("className", classroomService.findClassById(id).getClassName());
        model.addAttribute("recordDate", attendanceRecord.getAttendanceDate());
        model.addAttribute("userName", user.getName());
        model.addAttribute("userEmail", user.getEmail());

        return "teacher/attendanceRecord.html";
    }


    @PostMapping("/teacher/{hashedTeacherId}/delete/{courseHashedId}/{hashedUid}")
    @ResponseBody
    public ResponseEntity<String> deleteStudentFromClass(@PathVariable("hashedTeacherId") String teacherHashedId,
                                @PathVariable("courseHashedId") String classroomHashedId,
                                @PathVariable("hashedUid") String studentHashedUid,
                                Model model,
                                HttpSession session) {

        /*
         * This method is used to remove a student from a class   
         */
        User user = (User) session.getAttribute("session_user");
        if (user == null) {
            // Redirect to login page or handle unauthorized access
            return ResponseEntity.badRequest().body("error");
        }
        Long teacherId = userService.decodeUserID(teacherHashedId);
        if (!user.getUid().equals(teacherId) || classroomService.invalidRoleAccess(user)) {
            return ResponseEntity.badRequest().body("error");
        }
        Long classroomId = classroomService.decodeClassId(classroomHashedId);
        Classroom classroom = classroomService.findClassById(classroomId);
        Long studentId = userService.decodeUserID(studentHashedUid);
        User student = userService.findByUid(studentId);
        
        classroomService.removeStudentFromClass(student, classroom);
        
        return ResponseEntity.ok().body("success");
                                }


    // --------------------------------UPDATE AND CHANGE STATUS------------------
    @PostMapping("/teacher/{hashedTeacherId}/{courseHashedId}/entry/{entryId}")
    public String updateAttendanceStatus(
                                @PathVariable("hashedTeacherId") String hashedTeacherId,
                            @PathVariable("courseHashedId") String courseHashedId,
                            @RequestParam("entryId") String entryId,
                            @RequestParam("status") String status,
                            @RequestParam("recordId") String recordId,
                            Model model,
                            HttpSession session) {
        AttendanceEntry entry = this.attendanceEntryService.findEntryById(entryId);
        Boolean newStatus = true;
        System.out.println("VAI CA LONEEEEE");
        if ( status.equals("Absent")){
            newStatus = false;
        }
        entry.setIsCheckedIn(newStatus);
        attendanceEntryService.saveAttendanceEntry(entry);
        System.out.println("save succeed");
    
        AttendanceRecord attendanceRecord = attendanceRecordService.findRecordById(recordId);  
        model.addAttribute("attendanceRecord", attendanceRecord);
        model.addAttribute("attendanceEntries", attendanceRecord.getAttendanceEntries());
        return "teacher/attendanceRecord.html";
    }
    @GetMapping("/teacher/{hashedTeacherId}/editSeatMap/{courseHashedId}")
    public String getEditSeatMap(@PathVariable("hashedTeacherId") String teacherHashedId,
                                @PathVariable("courseHashedId") String classroomHashedId,
                                HttpSession session,
                                Model model) {
        /*
         * This method is used to return a page that teacher edits the seatMap structure
         */ 
        User sessionUser = (User) session.getAttribute("session_user");
        if (sessionUser == null) {
            return "redirect:/user/login";
        }
        Long teacherId = userService.decodeUserID(teacherHashedId);
        if (!sessionUser.getUid().equals(teacherId)) {
            return "redirect:/user/login";
        }
        if (classroomService.invalidRoleAccess(sessionUser)) {
            return "user/unauthorized.html";
        }
        Long classId = classroomService.decodeClassId(classroomHashedId);
        Classroom classroom = classroomService.findClassById(classId);
        model.addAttribute("classroom", classroom);
        model.addAttribute("hashedTeacherId", teacherHashedId);
        model.addAttribute("hashedCid", classroomHashedId);
        return "teacher/editSeatMap.html";
    }
}