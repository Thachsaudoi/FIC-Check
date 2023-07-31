'use strict';
import {saveCurrentSeatMap, loadSeatMap, postDefaultSeatmap, clearCurrentSeatMap } from '../attendanceController.js';
import { DEFAULT_SEATMAP } from '../SEATMAP.js';

let startAttendanceForm = document.getElementById("startAttendanceForm"); 
let userName = document.querySelector('#teacherName').value.trim();
let hashedCid = document.querySelector('#hashedCid').value.trim();
let teacherHashedId = document.querySelector('#teacherHashedId').value.trim();
let attendanceStatus = document.querySelector('#attendanceStatus').value.trim();

const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");
const stopButton = document.getElementById("stopButton");
const statusDiv = document.getElementById("status");

//madeChanges is used to detect if the teacher has made any changes to the seatMap
let madeChanges = false;
let attendanceStatusDisplay;
const totalSeats = 48;
const seatMap = {
  seats: []
};
let stompClient = null;

function updateStatus(status) {
  if (status === "start") {
    startButton.style.display = "none";
    pauseButton.style.display = "inline";
    stopButton.style.display = "inline";
    attendanceStatusDisplay = "Live"
  }
  if (status === "pause"){
    startButton.style.display = "inline";
    pauseButton.style.display = "none";
    stopButton.style.display = "inline";
    attendanceStatusDisplay = "Paused"
  }
  if (status === "stop") {
    startButton.style.display = "inline";
    pauseButton.style.display = "none";
    stopButton.style.display = "none";
    attendanceStatusDisplay = "Not started"
  }
  statusDiv.innerHTML = "";
  statusDiv.insertAdjacentHTML("beforeend", `<strong>Attendance Status:</strong> ${attendanceStatusDisplay}`);
}

document.addEventListener("DOMContentLoaded", async function(event) {
  //If teacher refresh the page, it will connect again
  if (attendanceStatus === "live") {
    updateStatus("start");
    madeChanges = true;
    connect()
  } else if (attendanceStatus === "pause") {
    madeChanges = true;
    updateStatus("pause")
  } else if (attendanceStatus === "not_started") {
    updateStatus("stop");
  } 

  updateBackButton(madeChanges);
  await fetchCurrentSeatMap(hashedCid);
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
      startClassAttendance()
      //This is for when detecting the go back button while taking attendance
      window.history.pushState({}, null, null)
      updateBackButton(madeChanges);
      Swal.fire(
        'Class Started!',
        'Students can now mark themselves as present for this class. ',
        'success'
      )
    }
  })

}

function pauseAttendance() {
  pauseClassAttendance() ; 
}

async function stopAttendance() {
 
  // Implement your logic to stop taking attendance and save the data

  if (confirm('Save and exit this class ?')) {
    stopClassAttendance() ;
    saveClassAttendance() ; 
  }

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
      // attendanceStatus = "not_started"
      
    } else {
      const errorText = await response.text();
      console.log("Error:", errorText);
    }
  } catch (error) {
    console.log("Error:", error);
  }
}

//start class attendance 
function startClassAttendance(){ 
  $.ajax({
    type: 'POST',
    url: '/teacher/course/startAttendance',
    data: { 
        hashedCid: hashedCid,
        attendanceStatus: 'live'
    },
    success: function(response) {
        attendanceStatus = 'live'
          connect(event); 
    },
    error: function(xhr, status, error) {
      // Handle any errors that occur during the request
      console.error('An error occurred while starting attendance:', error);
    }
  });
  updateStatus("start")
}

//stop class attendance
function stopClassAttendance() { 
    $.ajax({
      type: 'POST',
      url: '/teacher/course/startAttendance',
      data: { 
          hashedCid: hashedCid,
          attendanceStatus: 'not_started'
      },
      success: function(response) {
              attendanceStatus = 'not_started' // Disconnect when stopping attendance
              disconnect(event);

      },
      error: function(xhr, status, error) {
        // Handle any errors that occur during the request
        console.error('An error occurred while starting attendance:', error);
      }
    });
    updateStatus("stop");
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

//pause class Attendance
function pauseClassAttendance() { 
  $.ajax({
    type: 'POST',
    url: '/teacher/course/startAttendance',
    data: { 
        hashedCid: hashedCid,
        attendanceStatus: 'pause'
    },
    success: function(response) {
      pauseAttendanceWS()
      attendanceStatus = 'pause'
      console.log('paused')

    },
    error: function(xhr, status, error) {
      // Handle any errors that occur during the request
      console.error('An error occurred while starting attendance:', error);
    }
  });
  updateStatus("pause")
}


startButton.addEventListener("click", startAttendance);
pauseButton.addEventListener("click", pauseAttendance);
stopButton.addEventListener("click", stopAttendance);


function handleGoBack() {
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
  }).then((result) => {
    if (result.isConfirmed) {
      // The user clicked "Save Changes"
      //The title of the pop up will be different depends on isLive:
      let titleDisplay = (attendanceStatus==="live") ? "Attendance Stopped" : "Success"; 
      (async () => {
        try {
          if (!(attendanceStatus === "not_started")) {
            //If class is live or pause then stop
            await stopClassAttendance();
          }
          await saveClassAttendance();
          await Swal.fire({
            title: titleDisplay,
            text: 'Your changes have been saved.',
            icon: 'success'
          });
          //Redirect to dashboard and clear out map
          clearCurrentSeatMap(hashedCid);
          window.location.href = `/teacher/dashboard`;
        } catch (error) {
          // Handle any errors that occur during the process
          console.error(error);
        }
      })();
    }
    if (result.dismiss === Swal.DismissReason.cancel) {
      //User press 'Leave without saving'
      if (!(attendanceStatus === "not_started")) {
        //If class is live or pause then stop
        stopClassAttendance();
      }
      //Redirect to dashboard and clear out map
      clearCurrentSeatMap(hashedCid);
      window.location.href = `/teacher/dashboard`;
    } else {
      //Handle the case where user press outside of the popup to close the form
      return;
    }

  })
}
console.log(attendanceStatus)
//Detect if teacher press back button in the browser
window.addEventListener('popstate', () => handleGoBack());

function updateBackButton() {
  const backToDashboard = document.querySelector('.back');
  if (attendanceStatus === "not_started") {
    // If the teacher already saved or never made any changes
    backToDashboard.addEventListener('click', ()=> {
      window.location.href =`/teacher/dashboard`;
    })
  } else {
    backToDashboard.addEventListener('click', () => handleGoBack());
    //If teacher made changes 
  }
}