import {saveCurrentSeatMap, loadSeatMap, postDefaultSeatmap } from '../attendanceController.js';
import { DEFAULT_SEATMAP } from '../SEATMAP.js';

var socket = new SockJS('/ws');
var stompClient = Stomp.over(socket);
let hashedCid = document.querySelector('#hashedCid').value.trim();
let studentName = document.querySelector('#studentName').value.trim();
let studentEmail = document.querySelector('#studentEmail').value.trim();

let isLive = document.querySelector('#isLive').value.trim();


function disableClick() {
  //FRONT END ADD MORE
    document.querySelector('#classroomContainer').style.pointerEvents = 'none';
}

function enableClick() {
  document.querySelector('#classroomContainer').style.pointerEvents = '';
}


//total number of seat 
const totalSeats = 48;
const seatMap = {
  seats: []
};
let selectedSeatElement = null;


// Connect to the WebSocket server
stompClient.connect({}, onConnected, onError);

// Handle error in WebSocket connection
function onError(error) {

    console.error("Error connecting to WebSocket server:", error);
}

document.addEventListener("DOMContentLoaded", (event) => {
  if (isLive === "false") {
    disableClick();
  } else {
    enableClick();
  }
  fetchCurrentSeatMap(hashedCid);
})



function onConnected() {
  // Subscribe to the Public Topic
  stompClient.subscribe('/topic/' + hashedCid + '/public', onMessageReceived);
}

function onMessageReceived(payload) {
  console.log('Received Payload:', payload);

  try {
    const message = JSON.parse(payload.body);
    console.log('Parsed Message:', message);

    if (message.type === 'StartAttendance') {
      // Handle StartAttendance message
      console.log(`${message.sender} joined!`);
      enableClick();
    } else if (message.type === 'StopAttendance') {
      // Handle StopAttendance message
      //ADD FRONT END TO HANDLE STOP ATTENDANCE
      disableClick();
    } else {
      // Handle other message types
      fetchCurrentSeatMap(hashedCid); // Fetch the seat map data
    }
  } catch (error) {
    // Handle any errors during message parsing
    console.error('Error parsing message:', error);
  }
}
  
  
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

async function studentGenerateSeatMap() {
    for (let i = 1; i <= totalSeats; i++) {
      seatMap.seats.push({
        seatNumber: String(i),
        studentName: ''
      });
    }
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
  
          if (seatMap.seats[seatIndex].studentName !== '') {
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
                  seatMap.seats[seatIndex].studentName = studentName;
                  seatMap.seats[seatIndex].studentEmail = studentEmail;
                  event.target.innerText = seatMap.seats[seatIndex].seatNumber + ' - ' + studentName;
                  event.target.classList.add('selected');
                  selectedSeatElement = event.target;
                  Swal.fire('Seat Change Confirmed', 'Your seat has been successfully updated. Please check the updated seatmap for your new assigned seat.', 'success');
                  saveCurrentSeatMap(seatMap, stompClient, hashedCid)
                  // maybe i can pass the in the new seat map.
                } else if (result.isDenied) {
                  Swal.fire('Seat Change Cancelled', 'Your seat change request has been cancelled. Your current seat assignment will remain unchanged.', 'info');
                }
              });
            } else {
              // Select a new seat
              if (confirm("Check in this seat? ")) {
                seatMap.seats[seatIndex].studentName = studentName;
                seatMap.seats[seatIndex].studentEmail = studentEmail;
                event.target.innerText = seatMap.seats[seatIndex].seatNumber + ' - ' + studentName;
                event.target.classList.add('selected');
                selectedSeatElement = event.target;
                saveCurrentSeatMap(seatMap, stompClient, hashedCid)
              }
            
            }
          }
        });
  
        lineElement.appendChild(seatElement);
      }
  
      seatMapContainer.appendChild(lineElement);
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
          await studentGenerateSeatMap();
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