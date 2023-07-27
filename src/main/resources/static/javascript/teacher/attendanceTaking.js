'use strict';
import { DEFAULT_SEATMAP } from '../SEATMAP.js';

let startAttendanceForm = document.getElementById("startAttendanceForm"); 
let userName = document.querySelector('#teacherName').value.trim();
let hashedCid = document.querySelector('#hashedCid').value.trim();
let isLive = document.querySelector('#isLive').value === 'true';
let attendanceButton = document.querySelector('#attendanceButton');
attendanceButton.textContent = isLive ? 'Stop taking attendance' : 'Start taking attendance';
const saveAttendanceForm = document.getElementById('saveAttendanceForm');
console.log(isLive)
let activitiesLog = document.getElementById("activities-log")
const totalSeats = 48;
const seatMap = {
  seats: []
};
let selectedSeatElement = null;
let stompClient = null;

function toggleAttendanceButton(isLive) {
    return isLive ? "Stop taking attendance" : "Start taking attendance"
}


saveAttendanceForm.addEventListener("submit", async function(event){
  console.log("ADJAWKdja")
  event.preventDefault(); // Replace with the actual hashedCid value
  if (confirm('Save changes in this class?')) {
    try {
      // Make the POST request
      const response = await fetch(`/ficcheck/api/classroom/POST/attendanceRecord/${hashedCid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Adjust the content type if needed
        },
        body: JSON.stringify({}), // Replace empty object with the data you want to send in the request body
      });

      if (response.ok) {
        const result = await response.text();
        console.log("Success:", result);
        // Handle success (you can show a success message or perform any other action)
      } else {
        const errorText = await response.text();
        console.log("Error:", errorText);
        // Handle error (you can show an error message or perform any other action)
      }
    } catch (error) {
      console.log("Error:", error);
      // Handle any other errors that might occur during the request
    }
  }
})

document.addEventListener("DOMContentLoaded", async function(event) {
  //If teacher refresh the page, it will connect again
  if (isLive) {
    connect()
  }
  await fetchCurrentSeatMap(hashedCid);
});

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
                if (!isLive) {
                    isLive = true;
                    connect(event);
                    // Connect when starting attendance
                    fetchCurrentSeatMap(hashedCid);
                } else {
                    isLive = false;// Disconnect when stopping attendance
                    disconnect(event);
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



function disconnect(event) {
    let data = {
        type:"StopAttendance",
        hashedCid: hashedCid
    }
    stompClient.send("/app/classroom.attendance/" + hashedCid,
        {},
        JSON.stringify(data)
    );

}

function connect(event) {

    if (userName && hashedCid) {

        var socket = new SockJS('/ws/'); 
        stompClient = Stomp.over(socket);
        fetchCurrentSeatMap(hashedCid)
        stompClient.connect({}, onConnected, onError);
    } 
}

function onConnected() {
    // Subscribe to the Public Topic
    stompClient.subscribe('/topic/' + hashedCid + '/public', onMessageReceived);
    // Tell your username to the server
    // Before connecting to the WebSocket
    let data = {
        sender: userName,
        type: 'StartAttendance',
        hashedCid: hashedCid
    }
    stompClient.send("/app/classroom.attendance/" + hashedCid,
        {},
        JSON.stringify(data)
    );

}


function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);

    var messageElement = document.createElement('li');

    if(message.type === 'StartAttendance') {
        messageElement.classList.add('event-message');
        messageElement.textContent = message.sender + ' joined!';
    }
    else if (message.type === 'StopAttendance') {
    } 
    else {
        fetchCurrentSeatMap(hashedCid);
    }
  
}

// Handle error in WebSocket connection
function onError(error) {
    console.error("Error connecting to WebSocket server:", error);
}

async function fetchCurrentSeatMap(hashedCid) {
    try {
        const response = await fetch(`/ficcheck/api/classroom/GET/currentSeatMap/${hashedCid}`);
        // Check the response status to handle different scenarios
        if (response.status === 200) {
          const responseBody = await response.text();
          if (responseBody === "none") {
            // Seat map data is not available, use default seat map
            postDefaultSeatmap(DEFAULT_SEATMAP);
          } else {
            // Default seat map data is available
            const data = JSON.parse(responseBody);
           
            await generateSeatMap();
            await loadSeatMap(data);
          }
        } else {
          // Handle other status codes if needed
          console.log('Error:', response.status);
        }
      } catch (error) {
        // Handle any errors that occurred during the fetch
        console.error('Error:', error);
      }
}
/*
  save seatMap everytime there is changes to the seatmap
  */
async function saveCurrentSeatMap(updatedSeatMap) {
  console.log(updatedSeatMap)
  try {

  const response = await fetch(`/ficcheck/api/classroom/POST/currentSeatMap/${hashedCid}`, {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedSeatMap),
  });

  if (response.ok) {
    if (stompClient) {
      stompClient.send("/app/classroom.sendSelectedSeat/" + hashedCid, {},JSON.stringify(seatMap));
    }
      console.log("OK")
      
  } else {
      console.error('Error:', response.status);
  }
  } catch (error) {
  console.error('Error:', error);
  }
}

async function postDefaultSeatmap(updatedSeatMap) {
  try {

      const response = await fetch(`/ficcheck/api/classroom/POST/defaultSeatMap/${hashedCid}`, {
          method: 'POST',
          headers: {
          'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedSeatMap),
      });
  
      if (response.ok) {
          console.log("updated default seat mep")
      } else {
          console.error('Error:', response.status);
      }
      } catch (error) {
      console.error('Error:', error);
  }
}

function loadSeatMap(data) {
  //TODO: confirm that the data is correct
  // if not: find someway to work with the fetch data.
      // Update seatMap object with loaded data
  seatMap.seats = data.seats;
  
  // Color the occupied seats and display the student name
  const seats = document.querySelectorAll('.seat');
  seats.forEach((seat) => {
    const seatIndex = parseInt(seat.getAttribute('data-seat-index'));
    const { seatNumber, studentName } = seatMap.seats[seatIndex];
    if (studentName !== '') {
      seat.classList.add('occupied');
      seat.insertAdjacentHTML('beforeend', `<br>${studentName}`);
    }
  });
  
}

for (let i = 1; i <= totalSeats; i++) {
  seatMap.seats.push({
    seatNumber: String(i),
    studentName: ''
  });
}

function generateSeatMap() {
  const seatMapContainer = document.getElementById('seatMapContainer');
  seatMapContainer.innerHTML = '';

  const seatsPerLine = 12;
  const totalLines = 4;

  for (let line = 1; line <= totalLines; line++) {
    const lineElement = document.createElement('div');
    lineElement.classList.add('line');

    for (let seat = 1; seat <= seatsPerLine; seat++) {
      const seatIndex = (line - 1) * seatsPerLine + seat - 1;
      const seatElement = document.createElement('div');
      seatElement.classList.add('seat');
      seatElement.innerText = seatMap.seats[seatIndex].seatNumber;
      seatElement.setAttribute('data-seat-index', seatIndex);

      // Check if the seat is part of a group of three
      if ((seat - 1) % 3 === 0) {
        seatElement.classList.add('group-start');
      }

      seatElement.addEventListener('click', (event) => {
        const seatIndex = parseInt(event.target.getAttribute('data-seat-index'));
        const { studentName } = seatMap.seats[seatIndex];

        if (studentName !== '') {
          // Seat is already occupied, ask if the teacher wants to remove the student
          Swal.fire({
            title: 'Remove Student from Seat?',
            text: `Do you want to remove ${studentName} from this seat?`,
            showDenyButton: true,
            confirmButtonText: 'Yes, Remove',
            denyButtonText: 'No, Cancel',
            icon: 'question'
          }).then((result) => {
            if (result.isConfirmed) {
              // Teacher confirmed removal, update seat data
              seatMap.seats[seatIndex].studentName = '';
              seatMap.seats[seatIndex].studentEmail = '';
              seatElement.innerText = seatMap.seats[seatIndex].seatNumber;
              seatElement.classList.remove('occupied');

              // Save the updated seat map
              saveCurrentSeatMap(seatMap);
            }
          });
        } else {
          // Seat is empty, you can handle the case where the teacher can perform other actions when a vacant seat is clicked
        }
      });

      lineElement.appendChild(seatElement);
    }

    seatMapContainer.appendChild(lineElement);
  }
}


await fetchCurrentSeatMap(hashedCid);

// Add event listeners to the buttons
const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");
const stopButton = document.getElementById("stopButton");
const statusDiv = document.getElementById("status");

let attendanceStatus = "not_started";

function updateStatusMessage() {
  statusDiv.innerHTML = "";
  statusDiv.insertAdjacentHTML("beforeend", `<strong>Attendance Status:</strong> ${attendanceStatus}`);
}
function startAttendance() {
  startButton.style.display = "none";
  pauseButton.style.display = "inline";
  stopButton.style.display = "inline";
  attendanceStatus = "Live";
  updateStatusMessage();
  // Implement your logic to start taking attendance

}

function pauseAttendance() {
  startButton.style.display = "inline";
  pauseButton.style.display = "none";
  stopButton.style.display = "inline";

  attendanceStatus = "Paused";
  updateStatusMessage();
  // Implement your logic to pause taking attendance

}

function stopAttendance() {
  startButton.style.display = "inline";
  pauseButton.style.display = "none";
  stopButton.style.display = "none";

  attendanceStatus = "Stopped";
  updateStatusMessage();
  // Implement your logic to stop taking attendance and save the data

}

startButton.addEventListener("click", startAttendance);
pauseButton.addEventListener("click", pauseAttendance);
stopButton.addEventListener("click", stopAttendance);