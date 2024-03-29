'use strict';
import {saveCurrentSeatMap, loadSeatMap, postDefaultSeatmap, clearCurrentSeatMap } from '../attendanceController.js';
import { DEFAULT_SEATMAP } from '../SEATMAP.js';

let userName = document.querySelector('#teacherName').value.trim();
let hashedCid = document.querySelector('#hashedCid').value.trim();
let attendanceStatus = document.querySelector('#attendanceStatus').value.trim();

const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");
const stopButton = document.getElementById("stopButton");
const statusDiv = document.getElementById("status");


let attendanceStatusDisplay;
const totalSeats = 48;
const seatMap = {
  seats: []
};
let stompClient = null;

document.addEventListener("DOMContentLoaded", async function() {
  //If teacher refresh the page, it will connect again
  //Update the text in attendanceStatus
  if (attendanceStatus === "live") {
    updateStatus("start");
    connect()
  } else if (attendanceStatus === "pause") {
    updateStatus("pause")
  } else if (attendanceStatus === "not_started") {
    updateStatus("stop");
  } 
  await fetchCurrentSeatMap(hashedCid);
});


startButton.addEventListener("click", startAttendance);
pauseButton.addEventListener("click", pauseAttendance);
stopButton.addEventListener("click", stopAttendance);


function updateStatus(status) {
  if (status === "start") {
    attendanceStatus = "live"
    startButton.style.display = "none";
    pauseButton.style.display = "inline";
    stopButton.style.display = "inline";
    attendanceStatusDisplay = "Live"
  }
  if (status === "pause"){
    attendanceStatus = "pause"
    startButton.style.display = "inline";
    pauseButton.style.display = "none";
    stopButton.style.display = "inline";
    attendanceStatusDisplay = "Paused"
  }
  if (status === "stop") {
    attendanceStatus = 'not_started'
    startButton.style.display = "inline";
    pauseButton.style.display = "none";
    stopButton.style.display = "none";
    attendanceStatusDisplay = "Not started"
  }
  statusDiv.innerHTML = "";
  statusDiv.insertAdjacentHTML("beforeend", `Attendance Status: ${attendanceStatusDisplay}`);
}

/*----------------- ATTENDANCE -----------------*/

function startAttendance() {
  Swal.fire({
    title: 'Start Attendance?',
    text: "Are you ready to begin attendance for this class?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes!'
  }).then((result) => {
    if (result.isConfirmed) {
      handleClassAttendance("start")
      updateStatus("start")
      //This is for when detecting the go back button while taking attendance
      window.history.pushState({}, null, null)
      Swal.fire(
        'Class Started!',
        'Students can now mark themselves as present for this class. ',
        'success'
      )
    }
  })

}

function pauseAttendance() {
  handleClassAttendance("pause") ; 
}

async function stopAttendance() {
  Swal.fire({
    title: 'Stop Attendance?',
    text: "Are you sure you want to stop taking attendance for this class?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes!'
  }).then((result) => {
    if (result.isConfirmed) {
      handleClassAttendance("stop")
      saveClassAttendance(); 
      updateStatus("stop")
      Swal.fire(
        'Attendance Stopped!',
        'Attendance for this class has been closed. Students cannot check in anymore.',
        'success'
      )
    }
  })
}

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
      
    } else {
      const errorText = await response.text();
      console.log("Error:", errorText);
    }
  } catch (error) {
    console.log("Error:", error);
  }
}


//stop class attendance
async function handleClassAttendance(type) {
  let attendanceData;
  if (type === "start") {
    attendanceData = "live";
  } else if (type === "pause") {
    attendanceData = "pause";
  } else if (type === "stop") {
    attendanceData = "not_started";
  }
  let data = {
    hashedCid: hashedCid,
    attendanceStatus: attendanceData,
  };
  const response = await fetch('/teacher/course/startAttendance', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (response.ok) {
    if (type === "start") {
      attendanceStatus = "live";
      connect();
    } else if (type === "pause") {
      pauseAttendanceWS();
      updateStatus("pause");
    } else if (type === "stop") {
      attendanceStatus = "not_started";
      sendStopAttendanceWS();
    }
  }
}

/*----------------- GO BACK -----------------*/

//Detect if teacher press back button in the browser
//browser go back button
window.addEventListener('popstate', (event) => handleGoBack(event));

//IMPORTANT
//If the status is live or pause => ask to save
//Custom backbutton
const backToDashboard = document.querySelector('.back');
backToDashboard.addEventListener('click', async (event) => {
  event.preventDefault();
  if (attendanceStatus === "live" || attendanceStatus === "pause") {
    handleGoBack(event);
  } else {
    await clearCurrentSeatMap(hashedCid, stompClient);
    window.location.href =`/teacher/dashboard`;
  }
});


function handleGoBack(event) {
  event.preventDefault();
  //This function is called in the cases when teacher go back to previous url or
  //navigate out of the page, it will handle saving the attendance Data
  Swal.fire({
    title: 'Save Changes Before Leaving',
    text: "Leaving this page without saving will stop the session",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Save Changes',
    cancelButtonText: 'Leave Without Saving'
  }).then( async (result) => {
    if (result.isConfirmed) {
      // The user clicked "Save Changes"
      //The title of the pop up will be different depends on isLive:
      let titleDisplay = (attendanceStatus==="live") ? "Attendance Stopped" : "Success"; 
      try {
        if (!(attendanceStatus === 'not_started')) {
          //If class is live or pause then stop
          await handleClassAttendance("stop");
        }
        await saveClassAttendance();
        await clearCurrentSeatMap(hashedCid, stompClient);
        await Swal.fire({
          title: titleDisplay,
          text: 'Your changes have been saved.',
          icon: 'success'
        });
        //Redirect to dashboard and clear out map
        window.location.href = `/teacher/dashboard`;
      } catch (error) {
        // Handle any errors that occur during the process
        console.error(error);
      }
    }
    if (result.dismiss === Swal.DismissReason.cancel) {
      //User press 'Leave without saving'
        if (!(attendanceStatus === 'not_started')) {
          await handleClassAttendance("stop");
        }
      await clearCurrentSeatMap(hashedCid, stompClient)
      //Redirect to dashboard and clear out map
      window.location.href = `/teacher/dashboard`;
    } else {
      //Handle the case where user press outside of the popup to close the form
      return;
    }

  })
}

/*----------------- SEATMAP -----------------*/

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
        seatElement.style.left = `${seats[seatIndex].xPercentage}%`;
        seatElement.style.top = `${seats[seatIndex].yPercentage}%`;


        seatElement.addEventListener('click', (event) => {
          const seatIndex = parseInt(event.target.getAttribute('data-seat-index'));
          const { seatNumber, studentName } = seatMap.seats[seatIndex];

          if (studentName !== '') {
            // Seat is already occupied, ask if the teacher wants to remove the student
            Swal.fire({
              title: 'Remove Student from Seat?',
              text: `Do you want to remove ${studentName} from seat ${seatNumber}`,
              showDenyButton: true,
              confirmButtonText: 'Yes, Remove',
              denyButtonText: 'No, Cancel',
              icon: 'question'
            }).then((result) => {
              if (result.isConfirmed) {
                // Teacher confirmed removal, update seat data
                let studentEmail = seatMap.seats[seatIndex].studentEmail;
                seatMap.seats[seatIndex].studentName = '';
                seatMap.seats[seatIndex].studentEmail = '';
                seatElement.innerText = seatMap.seats[seatIndex].seatNumber;
                seatElement.classList.remove('occupied');

                // Save the updated seat map
                saveCurrentSeatMap(seatMap, stompClient, hashedCid);

                //Send to student with associated email noti
                sendRemoveSeatAlertWS(studentEmail)
                
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
          await postDefaultSeatmap(DEFAULT_SEATMAP, hashedCid);
          await teacherGenerateSeatMap(DEFAULT_SEATMAP);
          await loadSeatMap(DEFAULT_SEATMAP, seatMap)
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

/*----------------- WEBSOCKET -----------------*/
function connect() {

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

  if(message.type === 'StartAttendance') {
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


function sendStopAttendanceWS() {
  let data = {
      type:"StopAttendance",
      hashedCid: hashedCid
  }
  stompClient.send("/app/classroom.attendance/" + hashedCid,
      {},
      JSON.stringify(data)
  );
}

function sendRemoveSeatAlertWS(studentEmail) {
  let data = {
    type:"RemoveStudentFromSeat",
    hashedCid: hashedCid,
    userEmail: studentEmail
  }
  stompClient.send(`/app/classroom.removeStudentFromSeat/${hashedCid}/${studentEmail}`,
    {},
    JSON.stringify(data)
  );
}

function pauseAttendanceWS() {
  //Send websocket event to student saying the class is paused
  let data = {
    type:"PauseAttendance",
    hashedCid: hashedCid
  }
  stompClient.send("/app/classroom.attendance/" + hashedCid,
      {},
      JSON.stringify(data)
  );
}