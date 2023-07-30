'use strict';
import {saveCurrentSeatMap, loadSeatMap, postDefaultSeatmap } from '../attendanceController.js';
import { DEFAULT_SEATMAP } from '../SEATMAP.js';

let startAttendanceForm = document.getElementById("startAttendanceForm"); 
let userName = document.querySelector('#teacherName').value.trim();
let hashedCid = document.querySelector('#hashedCid').value.trim();
let isLive = document.querySelector('#isLive').value === 'true';
let attendanceButton = document.querySelector('#attendanceButton');
attendanceButton.textContent = isLive ? 'Stop taking attendance' : 'Start taking attendance';
const saveAttendanceForm = document.getElementById('saveAttendanceForm');
const totalSeats = 48;
const seatMap = {
  seats: []
};
let stompClient = null;


// function toggleStatus(isLive) {
//     isLive ? startAttendance() : stopAttendance();
// }


// saveAttendanceForm.addEventListener("submit", async function(event){
//   event.preventDefault(); // Replace with the actual hashedCid value
//   if (confirm('Save changes in this class?')) {
//     try {
//       // Make the POST request
//       const response = await fetch(`/ficcheck/api/classroom/POST/attendanceRecord/${hashedCid}`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json", // Adjust the content type if needed
//         },
//         body: JSON.stringify({}), // Replace empty object with the data you want to send in the request body
//       });

//       if (response.ok) {
//         const result = await response.text();
//         console.log("saved success:", result);
//         isLive = false;
//         // toggleStatus(isLive)
//         // Handle success (you can show a success message or perform any other action)
//       } else {
//         const errorText = await response.text();
//         console.log("Error:", errorText);
//         // Handle error (you can show an error message or perform any other action)
//       }
//     } catch (error) {
//       console.log("Error:", error);
//       // Handle any other errors that might occur during the request
//     }
//   }
// })

document.addEventListener("DOMContentLoaded", async function(event) {
  //If teacher refresh the page, it will connect again
  if (isLive) {
    connect()
  }
  await fetchCurrentSeatMap(hashedCid);
});

// startAttendanceForm.addEventListener('submit', function(event) {
//     event.preventDefault(); 
//     // Display confirmation dialog
//     const confirmed = confirm('Are you sure you want to start taking attendance for this class?');
//     if (confirmed) {

//         $.ajax({
//             type: 'POST',
//             url: '/teacher/course/startAttendance',
//             data: {
//                 hashedCid: hashedCid,
//                 isLive: !isLive
//             },
//             success: function(response) {
//                 if (!isLive) {
//                     isLive = true;
//                     connect(event);
//                 } else {
//                     isLive = false;// Disconnect when stopping attendance
//                     disconnect(event);
//                 }
//                 toggleStatus(isLive);
//             },
//             error: function(xhr, status, error) {
//               // Handle any errors that occur during the request
//               console.error('An error occurred while starting attendance:', error);
//             }
//           });
//     }
//   });



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

async function teacherGenerateSeatMap(data) {
  for (let i = 1; i <= totalSeats; i++) {
    seatMap.seats.push({
      seatNumber: String(i),
      studentName: ''
    });
  }
  const seatMapContainer = document.getElementById('seatMapContainer');
  seatMapContainer.innerHTML = '';
  let seats = data.seats

 
   for (let i =0 ;  i <seats.length ; i++) {


        const seatIndex = i ; 
        const seatElement = document.createElement('div');
        seatElement.classList.add('seat');
        seatElement.innerText = seats[seatIndex].seatNumber;
        seatElement.setAttribute('data-seat-index', seatIndex);

      

        // Set the position of the seat based on the coordinates from the DEFAULT_SEATMAP
        seatElement.style.position = 'absolute';
        seatElement.style.left = `${seats[seatIndex].xCoordinate}px`;
        seatElement.style.top = `${seats[seatIndex].yCoordinate}px`;

        
        
     

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
              saveCurrentSeatMap(seatMap, stompClient, hashedCid);
            }
          });
        } else {
          // Seat is empty, you can handle the case where the teacher can perform other actions when a vacant seat is clicked
        }
      });

    seatMapContainer.appendChild(seatElement);
  }
}

async function fetchCurrentSeatMap(hashedCid) {
  try {
      const response = await fetch(`/ficcheck/api/classroom/GET/currentSeatMap/${hashedCid}`);
      // Check the response status to handle different scenarios
      if (response.status === 200) {
        const responseBody = await response.text();
        if (responseBody === "none") {
          // Seat map data is not available, post default seatmap up
          postDefaultSeatmap(DEFAULT_SEATMAP, hashedCid);
        } else {
          // if find an already existed seatMap then use that data from backend
          const data = JSON.parse(responseBody);
          await teacherGenerateSeatMap(data);
          await loadSeatMap(data, seatMap);
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
  
  // Implement your logic to start taking attendance
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
              
                  isLive = true;
                  connect(event);
               
          },
          error: function(xhr, status, error) {
            // Handle any errors that occur during the request
            console.error('An error occurred while starting attendance:', error);
          }
        });
        startButton.style.display = "none";
        pauseButton.style.display = "inline";
        stopButton.style.display = "inline";
        attendanceStatus = "Live";
        updateStatusMessage();
  }

}

function pauseAttendance() {
  startButton.style.display = "inline";
  pauseButton.style.display = "none";
  stopButton.style.display = "inline";

  attendanceStatus = "Paused";
  updateStatusMessage();

  $.ajax({
    type: 'POST',
    url: '/teacher/course/startAttendance',
    data: { 
        hashedCid: hashedCid,
        isLive: !isLive
    },
    success: function(response) {

            isLive = false;// Disconnect when stopping attendance
            disconnect(event);

    },
    error: function(xhr, status, error) {
      // Handle any errors that occur during the request
      console.error('An error occurred while starting attendance:', error);
    }
  });

}

async function stopAttendance() {
 
  // Implement your logic to stop taking attendance and save the data

  if (confirm('Save and exit this class ?')) {


    stopClassAttendance() ;

    //save attendance
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
        console.log("saved success:", result);
        isLive = false;
        // toggleStatus(isLive)
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

}

function stopClassAttendance() { 
    $.ajax({
      type: 'POST',
      url: '/teacher/course/startAttendance',
      data: { 
          hashedCid: hashedCid,
          isLive: !isLive
      },
      success: function(response) {

              isLive = false;// Disconnect when stopping attendance
              disconnect(event);

      },
      error: function(xhr, status, error) {
        // Handle any errors that occur during the request
        console.error('An error occurred while starting attendance:', error);
      }
    });
    startButton.style.display = "inline";
    pauseButton.style.display = "none";
    stopButton.style.display = "none";

    attendanceStatus = "Stopped";
    updateStatusMessage();
}

const backToDashboard = document.querySelector('.back');

backToDashboard.addEventListener('click', async function(event) {
  event.preventDefault();


  const confirmed = confirm('Are you sure you want to back to dashboard, the attendacne will be stop?');
  
  if (confirmed) {
    stopClassAttendance() ;
    //save attendance
    saveClassAttendance() ;
    window.location.href = this.href;
  } else {
    console.log('User canceled the action.');
  }
});


//save Class Attendance
async function saveClassAttendance() { 
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
      console.log("saved success:", result);
      isLive = false;
      
    } else {
      const errorText = await response.text();
      console.log("Error:", errorText);
    }
  } catch (error) {
    console.log("Error:", error);
  }
}

startButton.addEventListener("click", startAttendance);
pauseButton.addEventListener("click", pauseAttendance);
stopButton.addEventListener("click", stopAttendance);



