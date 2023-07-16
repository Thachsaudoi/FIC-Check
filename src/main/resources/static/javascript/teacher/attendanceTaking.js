'use strict';

let startAttendanceForm = document.getElementById("startAttendanceForm"); 
let userName = document.querySelector('#teacherName').value.trim();
let hashedCid = document.querySelector('#hashedCid').value.trim();
let isLive = document.querySelector('#isLive').value === 'true';
let attendanceButton = document.querySelector('#attendanceButton');
attendanceButton.textContent = isLive ? 'Stop taking attendance' : 'Start taking attendance';
console.log(isLive)
function toggleAttendanceButton(isLive) {
    return isLive ? "Stop taking attendance" : "Start taking attendance"
}
let activitiesLog = document.getElementById("activities-log")

startAttendanceForm.addEventListener('submit', function(event) {
    event.preventDefault(); 
  
    // Display confirmation dialog
    const confirmed = confirm('Are you sure you want to start taking attendance for this class?');
    if (confirmed) {

        $.ajax({
            type: 'POST',
            url: '/teacher/course/startAttendance',
            data: {
                hashedCid: hashedCid,
                isLive: !isLive
            },
            success: function(response) {
              // Handle the success response from the server
              // Perform any client-side actions or updates based on the response
//              window.location.reload();
                // Handle the success response from the server
                // Perform any client-side actions or updates based on the response
                console.log("DI<AADADWA")
                if (!isLive) {
                    isLive = true;
                    connect(event); // Connect when starting attendance
                } else {
                    isLive = false;// Disconnect when stopping attendance
                }
                attendanceButton.textContent = toggleAttendanceButton(isLive);
            },
            error: function(xhr, status, error) {
              // Handle any errors that occur during the request
              console.error('An error occurred while starting attendance:', error);
            }
          });
    }
  });

var stompClient = null;


function connect(event) {

    if (userName && hashedCid) {

        var socket = new SockJS('/ws/'); // Use a unique URL for each class so the teacher
        stompClient = Stomp.over(socket);

        stompClient.connect({}, onConnected, onError);
    } 
    event.preventDefault();
}

function onConnected() {
    // Subscribe to the Public Topic
    stompClient.subscribe('/topic/' + hashedCid + '/public', onMessageReceived);
    // Tell your username to the server
    // Before connecting to the WebSocket
    let data = {
        sender: userName,
        type: 'JOIN',
        hashedCid: hashedCid
    }
    stompClient.send("/app/chat.addUser/" + hashedCid,
        {},
        JSON.stringify(data)
    );

}

function onError(error) {
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}



function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);

    var messageElement = document.createElement('li');

    if(message.type === 'JOIN') {
        messageElement.classList.add('event-message');
        messageElement.textContent = message.sender + ' joined!';
    }
    // } else if (message.type === 'LEAVE') {
    //     messageElement.classList.add('event-message');
    //     messageElement.textContent = message.sender + ' left!';
    // } else {
    //     messageElement.classList.add('chat-message');

    //     var avatarElement = document.createElement('i');
    //     var avatarText = document.createTextNode(message.sender[0]);
    //     avatarElement.appendChild(avatarText);
    //     avatarElement.style['background-color'] = getAvatarColor(message.sender);

    //     messageElement.appendChild(avatarElement);

    //     var usernameElement = document.createElement('span');
    //     var usernameText = document.createTextNode(message.sender);
    //     usernameElement.appendChild(usernameText);
    //     messageElement.appendChild(usernameElement);
    // }

    // var textElement = document.createElement('p');
    // var messageText = document.createTextNode(message.content);
    // textElement.appendChild(messageText);

    // messageElement.appendChild(textElement);

    // messageArea.appendChild(messageElement);
    // messageArea.scrollTop = messageArea.scrollHeight;
}


// usernameForm.addEventListener('submit', connect, true);
// messageForm.addEventListener('submit', sendMessage, true);
