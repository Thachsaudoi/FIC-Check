package com.ficcheck.ficcheck.attendanceSocket;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class attendanceMessage {

    private MessageType type;
    private String content;
    private String sender;
    private String hashedCid;

}
