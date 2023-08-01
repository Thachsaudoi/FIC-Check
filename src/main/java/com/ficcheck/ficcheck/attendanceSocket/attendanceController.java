package com.ficcheck.ficcheck.attendanceSocket;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class attendanceController {

    @MessageMapping("/classroom.sendSelectedSeat/{hashedCid}")
    @SendTo("/topic/{hashedCid}/public")
    public attendanceMessage sendSelectedSeat(@Payload attendanceMessage chatMessage) {
        attendanceMessage message = new attendanceMessage();
        message.setSender(chatMessage.getSender());
        message.setContent(chatMessage.getContent());
        message.setType(chatMessage.getType());
        return message;
    }

    @MessageMapping("/classroom.attendance/{hashedCid}")
    @SendTo("/topic/{hashedCid}/public")
    public attendanceMessage addUser(@Payload attendanceMessage chatMessage) {
        attendanceMessage message = new attendanceMessage();
        message.setSender("Server");
        message.setContent("User added: " + chatMessage.getSender());
        message.setType(chatMessage.getType());
        message.setHashedCid(chatMessage.getHashedCid());
        return message;
    }

    @MessageMapping("/classroom.removeStudentFromSeat/{hashedCid}/{userEmail}")
    @SendTo("/topic/{hashedCid}/public/{userEmail}")
    public attendanceMessage removeStudentFromSeat(@Payload attendanceMessage data) {
        attendanceMessage message = new attendanceMessage();
        message.setSender("Server");
        message.setContent("User added: " + data.getSender());
        message.setType(data.getType());
        message.setHashedCid(data.getHashedCid());
        return message;
    }

}


