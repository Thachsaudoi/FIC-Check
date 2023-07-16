// package com.ficcheck.ficcheck.chat;

// import org.springframework.messaging.handler.annotation.DestinationVariable;
// import org.springframework.messaging.handler.annotation.MessageMapping;
// import org.springframework.messaging.handler.annotation.Payload;
// import org.springframework.messaging.handler.annotation.SendTo;
// import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
// import org.springframework.stereotype.Controller;

// @Controller
// public class ChatController {

//     @MessageMapping("/chat.sendMessage")
//     @SendTo("/topic/{hashedCid}/public")
//     public ChatMessage sendMessage(
//             @Payload ChatMessage chatMessage,
//             @DestinationVariable String hashedCid
//     ) {
//         return chatMessage;
//     }

//     @MessageMapping("/chat.addUser")
//     @SendTo("/topic/{hashedCid}/public")
//     public ChatMessage addUser(
//             @Payload ChatMessage chatMessage,
//             SimpMessageHeaderAccessor headerAccessor
            
//     ) {
//         // Add username in web socket session
//         headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
//         return chatMessage;
//     }
// }
package com.ficcheck.ficcheck.chat;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    @MessageMapping("/chat.sendMessage/{hashedCid}")
    @SendTo("/topic/{hashedCid}/public")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage, @DestinationVariable String hashedCid) {
        ChatMessage message = new ChatMessage();
        message.setSender(chatMessage.getSender());
        message.setContent(chatMessage.getContent());
        message.setType(chatMessage.getType());
        return message;
    }

    @MessageMapping("/chat.addUser/{hashedCid}")
    @SendTo("/topic/{hashedCid}/public")
    public ChatMessage addUser(@Payload ChatMessage chatMessage) {
        ChatMessage message = new ChatMessage();
        message.setSender("Server");
        message.setContent("User added: " + chatMessage.getSender());
        return message;
    }

}


