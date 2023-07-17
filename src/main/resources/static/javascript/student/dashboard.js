var socket = new SockJS('/ws');
var stompClient = Stomp.over(socket);
let liveSession = document.getElementById('live-session');
let studentHashedId = document.querySelector('#studentHashedId').value;

// Connect to the WebSocket server
stompClient.connect({}, onConnected, onError);

// Handle successful connection
function onConnected() {
    // Subscribe to the topic where messages are received
    var classrooms = document.getElementsByClassName("classrooms");
    for (var i = 0; i < classrooms.length; i++) {
        var form = classrooms[i];
        let hashedCid = form.querySelector("#hashedCid").value.trim();
        let userName = form.querySelector("#userName").value.trim();
        if (userName && hashedCid) {
            stompClient.subscribe('/topic/' + hashedCid + '/public', onMessageReceived);
        }
    }
}

// Handle error in WebSocket connection
function onError(error) {

    console.error("Error connecting to WebSocket server:", error);
}

// Handle received messages
function onMessageReceived(payload) {
    // Parse the message payload
    var message = JSON.parse(payload.body);
    let liveClass = document.createElement('li');
    liveClass.className= "live-class";
    if (message.type === 'StartAttendance') {
        var a = document.createElement('a');
        let hrefValue = `/student/${studentHashedId}/courseStart/${message.hashedCid}`
        a.setAttribute("href", hrefValue);
        a.textContent = "Join today's class";// this line will beable to change what is shown on the student dashboard when is live
        liveClass.appendChild(a);//add link to the class
        liveClass.id = `class-${message.hashedCid}`
        liveSession.appendChild(liveClass); //add class under the live session
        
    }
    else if (message.type === 'StopAttendance') {
        const liveClass = document.getElementById(`class-${message.hashedCid}`); // get the id of the class that is no longer life.
        if (liveClass) {
            liveSession.removeChild(liveClass);
        } else {
            console.log("No live class element to remove.");
        }
    }
}

