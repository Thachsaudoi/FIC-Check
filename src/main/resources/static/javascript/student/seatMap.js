import {saveCurrentSeatMap, loadSeatMap, postDefaultSeatmap } from '../attendanceController.js';
import { DEFAULT_SEATMAP } from '../SEATMAP.js';

var socket = new SockJS('/ws');
var stompClient = Stomp.over(socket);
let hashedCid = document.querySelector('#hashedCid').value.trim();
let userName = document.querySelector('#studentName').value.trim();
let studentEmail = document.querySelector('#studentEmail').value.trim();

let attendanceStatus = document.querySelector('#attendanceStatus').value.trim();
const statusDiv = document.querySelector('#status');
const seatMap = {
  seats: []
};

document.addEventListener("DOMContentLoaded", async (event) => {
  toggleStatus(attendanceStatus);
  await fetchCurrentSeatMap(hashedCid, stompClient);
})

function toggleStatus(attendanceStatus) {
  let textToDisplay;
  if (attendanceStatus === "live") {
    textToDisplay = "Live"
    enableClick();
  } else if (attendanceStatus === "pause") {
    textToDisplay = "Paused"
    disableClick();
  } else if (attendanceStatus === "not_started") {
    textToDisplay = "Not Started"
    disableClick()
  } else if (attendanceStatus === "end") {
    textToDisplay = "Ended"
    disableClick()
  }
  statusDiv.innerHTML = `<b>Attendance Status:</b> ${textToDisplay}`;
}

function disableClick() {
  //FRONT END ADD MORE
    document.querySelector('#classroomContainer').style.pointerEvents = 'none';
}

function enableClick() {
  console.log(document.querySelector('#classroomContainer'))
  document.querySelector('#classroomContainer').style.pointerEvents = '';
}




/*----------------- SEATMAP -----------------  */

//total number of seat 
const totalSeats = 48;
let selectedSeatElement = null;
function checkedInStudent(studentEmail) {
  //This function is used to check if the student is in the class already
  //If yes then he click seat => change seat
  //If no then he click seat => check in
  for (const seat of seatMap.seats) {
    if (seat.studentEmail === studentEmail) {
      const seatIndex = parseInt(seat.seatNumber, 10)-1;
      selectedSeatElement = document.querySelector(`[data-seat-index="${seatIndex}"]`);
    }
  }
}

async function studentGenerateSeatMap(data) {
  for (let i = 1; i <= totalSeats; i++) {
    seatMap.seats.push({
      seatNumber: String(i),
      studentName: ''
    });
  }
  const seatMapContainer = document.querySelector('#seatMapContainer');
  seatMapContainer.innerHTML = '';
  let seats = data.seats;

  for (let i = 0; i < seats.length; i++) {
    const seatIndex = i;
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
        // Seat is already selected, display a message
        Swal.fire('Seat Already Selected', 'Seat is already taken.', 'info');
      } else {
        // Deselect the previously selected seat, if any
        if (selectedSeatElement != null) {
          Swal.fire({
            title: 'Confirm seat change',
            text: 'Are you sure you want to change your seat?',
            showDenyButton: true,
            confirmButtonText: 'Yes',
            denyButtonText: 'No',
            icon: 'question'
          }).then((result) => {
            if (result.isConfirmed) {
              // Remove previous seat selection
              const selectedSeatIndex = parseInt(selectedSeatElement.getAttribute('data-seat-index'));
              seatMap.seats[selectedSeatIndex].studentName = '';
              seatMap.seats[selectedSeatIndex].studentEmail = '';
              selectedSeatElement.innerText = seatMap.seats[selectedSeatIndex].seatNumber;
              selectedSeatElement.classList.remove('selected');

              // Select a new seat
              seatMap.seats[seatIndex].studentName = userName;
              seatMap.seats[seatIndex].studentEmail = studentEmail;
              event.target.innerText = seatMap.seats[seatIndex].seatNumber + ' - ' + studentName;
              event.target.classList.add('selected');
              selectedSeatElement = event.target;
              Swal.fire('Seat Change Confirmed', 'Your seat has been successfully updated', 'success');
              saveCurrentSeatMap(seatMap, stompClient, hashedCid);
              // maybe I can pass the new seat map here.
            } else if (result.isDenied) {
              Swal.fire('Seat Change Cancelled', 'Your seat change request has been cancelled. Your current seat assignment will remain unchanged.', 'info');
            }
          });
        } else {
          // Select a new seat
          if (confirm("Check in this seat? ")) {
            seatMap.seats[seatIndex].studentName = userName;
            seatMap.seats[seatIndex].studentEmail = studentEmail;
            event.target.innerText = seatMap.seats[seatIndex].seatNumber + ' - ' + studentName;
            event.target.classList.add('selected');
            selectedSeatElement = event.target;
            saveCurrentSeatMap(seatMap, stompClient, hashedCid);
          }
        }
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
          await studentGenerateSeatMap(DEFAULT_SEATMAP);
          await loadSeatMap(DEFAULT_SEATMAP, seatMap);
        } else {
          // if find an already existed seatMap then use that data from backend
          const data = JSON.parse(responseBody);
          await studentGenerateSeatMap(data);
          await loadSeatMap(data, seatMap);
          checkedInStudent(studentEmail);
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

/*----------------- WEBSOCKET -----------------  */

// Connect to the WebSocket server
stompClient.connect({}, onConnected, onError);

function onConnected() {
  // Subscribe to the Public Topic
  stompClient.subscribe(`/topic/${hashedCid}/public`, onMessageReceived);
  stompClient.subscribe(`/topic/${hashedCid}/public/${studentEmail}`, onMessageReceived)
}
function onMessageReceived(payload) {
  console.log('Received Payload:', payload);

  try {
    const message = JSON.parse(payload.body);
    console.log('Parsed Message:', message);
    
    if (message.type === 'StartAttendance') {
      attendanceStatus = "live"
    } 
    if (message.type === 'StopAttendance') {
      attendanceStatus = "end"
      console.log('stopped')
    }
    if (message.type === 'PauseAttendance') {
      attendanceStatus = "pause"
      console.log('paused')
    }
    if (message.type === 'ClearOutMap') {
      Swal.fire({
        icon: 'error',
        title: 'Attendance Session ended',
        text: 'Press anywhere to go back to dashboard',
      }).then(() => {
        // This code will be executed after the student clicks "OK" on the popup
        window.location.href = '/student/dashboard';
      });
    }
    if (message.type === 'RemoveStudentFromSeat') {
      Swal.fire({
        position: 'center',
        icon: 'info',
        title: 'You have been removed from your seat!',
        showConfirmButton: false,
        timer: 1500
      })
    }
    else {
      // Handle other message types
      fetchCurrentSeatMap(hashedCid); // Fetch the seat map data
    }
    toggleStatus(attendanceStatus)
  } catch (error) {
    // Handle any errors during message parsing
    console.error('Error parsing message:', error);
  }
}
// Handle error in WebSocket connection
function onError(error) {

  console.error("Error connecting to WebSocket server:", error);
}
