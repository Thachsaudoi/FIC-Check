var socket = new SockJS('/ws');
var stompClient = Stomp.over(socket);
let liveSession = document.getElementById('live-session');
let studentHashedId = document.querySelector('#studentHashedId').value;

document.addEventListener("DOMContentLoaded", function() {
    //Update live class in the livesession whenever student reload
    updateIsLive();
})
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

function updateIsLive() {
    /*
        FRONT END TAKES CARE OF THIS
        This function is to loop though the live classes and appear in the live
        Create element to display the live classes 
    */
    const classDetailsList = document.querySelectorAll(".classrooms");
    classDetailsList.forEach(classDetails => {
        const isLive = classDetails.querySelector("#isLive").value.trim();
        const hashedCid = classDetails.querySelector("#hashedCid").value.trim();
        //if find the LIVE CLASSROOM ID == List of enrolled class
        if (isLive === "true") {
            //take the classnam and room number
            const className = classDetails.querySelector("#className").textContent.trim();
            const roomNumber = classDetails.querySelector("#roomNumber").textContent.trim();
        
            // Create elements to display class name and room number
            const classDetailElement = document.createElement('li');
            classDetailElement.id=`class-${hashedCid}`
            const classDetailName = document.createElement('strong');
            const classDetailRoom = document.createElement('strong');
            classDetailName.textContent = `Class Name: ${className}`;
            classDetailRoom.textContent = `Room number: ${roomNumber}`;
            var a = document.createElement('a');
            let hrefValue = `/student/${studentHashedId}/courseStart/${hashedCid}`
            a.setAttribute("href", hrefValue);
            a.textContent = "Join today's class"; // this line will be able to change what is shown on the student dashboard when it is live
            classDetailElement.appendChild(a); // add link to the class
            classDetailElement.appendChild(classDetailName)
            classDetailElement.appendChild(classDetailRoom)
            liveSession.appendChild(classDetailElement)
        }
    })
}
// Handle error in WebSocket connection
function onError(error) {

    console.error("Error connecting to WebSocket server:", error);
}

// Handle received messages
function onMessageReceived(payload) {
    // Parse the message payload
    var message = JSON.parse(payload.body);
    if (message.type === 'StartAttendance') {
        updateIsLive();
    } else if (message.type === 'StopAttendance') {
        //WHEN THE TEACHER STOP TAKING ATTENDANCE
        const liveClass = document.getElementById(`class-${message.hashedCid}`); 
        // get the id of the class that is no longer life.
        if (liveClass) {
            liveSession.removeChild(liveClass);
        } else {
            console.log("No live class element to remove.");
        }
    }
}


