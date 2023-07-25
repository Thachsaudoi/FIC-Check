'use strict';
import { DEFAULT_SEATMAP } from '../SEATMAP.js';

let startAttendanceForm = document.getElementById("startAttendanceForm"); 
let userName = document.querySelector('#teacherName').value.trim();
let hashedCid = document.querySelector('#hashedCid').value.trim();
let isLive = document.querySelector('#isLive').value === 'true';
let attendanceButton = document.querySelector('#attendanceButton');
attendanceButton.textContent = isLive ? 'Stop taking attendance' : 'Start taking attendance';
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
            saveCurrentSeatMap(DEFAULT_SEATMAP);
          } else {
            // Default seat map data is available
            const data = JSON.parse(responseBody);
           
            await generateSeatMap();
            await loadSeatMap(data);
            move();
            
            
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
      stompClient.send("/app/classroom.sendSelectedSeat/" + hashedCid, {},JSON.stringify(seatMap));
      
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



//load seat map from database 
function loadSeatMap(data) {
  // Update seatMap object with loaded data
  seatMap.seats = data.seats;

  // Color the occupied seats and display the student name
  const seats = document.querySelectorAll('.seat');
  seats.forEach((seat) => {
    seat.style.position = 'absolute';
    const seatIndex = parseInt(seat.getAttribute('data-seat-index'));
    const { seatNumber, studentName } = seatMap.seats[seatIndex];
    seat.style.left = `${DEFAULT_SEATMAP.seats[seatIndex].xCoordinate}px`;
    seat.style.top = `${DEFAULT_SEATMAP.seats[seatIndex].yCoordinate}px`;
    if (studentName !== '') {
      seat.classList.add('occupied');
      seat.innerText = `${seatNumber} - ${studentName}`;
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
      seatElement.innerText = DEFAULT_SEATMAP.seats[seatIndex].seatNumber;
      seatElement.setAttribute('data-seat-index', seatIndex);

      // Check if the seat is part of a group of three
      if ((seat - 1) % 3 === 0) {
        seatElement.classList.add('group-start');
      }

      // Set the position of the seat based on the coordinates from the DEFAULT_SEATMAP
      seatElement.style.position = 'absolute';
      seatElement.style.left = `${DEFAULT_SEATMAP.seats[seatIndex].xCoordinate }px`;
      seatElement.style.top = `${DEFAULT_SEATMAP.seats[seatIndex].yCoordinate}px`;

      seatElement.addEventListener('click', (event) => {
        console.log("this is the selected seat: " + selectedSeatElement);
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
                seatMap.seats[seatIndex].studentName = '';
                seatMap.seats[seatIndex].studentEmail = '';
                event.target.innerText = seatMap.seats[seatIndex].seatNumber + ' - ' + studentName;
                event.target.classList.add('selected');
                selectedSeatElement = event.target;
                Swal.fire('Seat Change Confirmed', 'Your seat has been successfully updated. Please check the updated seatmap for your new assigned seat.', 'success');
                saveCurrentSeatMap(seatMap, hashedCid, stompClient)
                // maybe i can pass the in the new seat map.
              } else if (result.isDenied) {
                Swal.fire('Seat Change Cancelled', 'Your seat change request has been cancelled. Your current seat assignment will remain unchanged.', 'info');
              }
            });
          } else {
            //TODO: remember to uncomment this 
            //Select a new seat
            // if (confirm("Check in this seat? ")) {
            //   // seatMap.seats[seatIndex].studentName = '';
            //   // seatMap.seats[seatIndex].studentEmail = '';
            //   // event.target.innerText = seatMap.seats[seatIndex].seatNumber + ' - ' + studentName;
            //   // event.target.classList.add('selected');
            //   // selectedSeatElement = event.target;
            //   // saveCurrentSeatMap(seatMap, hashedCid, stompClient)
            // }
          
          }
        }
      });

      lineElement.appendChild(seatElement);

    }

    seatMapContainer.appendChild(lineElement);
  }

}

const move = function () {
  const seats = document.querySelectorAll(".seat");

  seats.forEach((seat) => {
    seat.addEventListener("mousedown", (e) => {
      // Prevent text selection while dragging
      e.preventDefault();

      // Get the initial position of the seat relative to the entire document
      const rect = seat.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;

      document.onmousemove = (e) => {
        const x = e.pageX - offsetX;
        const y = e.pageY - offsetY;

        // Move the seat to the new position
        seat.style.left = x-100 + "px";
        seat.style.top = y -150+ "px";

        console.log("I am here");
        console.log("asdfasdfsadfas;ldkfjasdl;fkasjdfklasdjfal;ksdjfa;lsdfjasdl;fasdkfl;askdjfasl;dfjkasld;fajsdfkl") ;
        printSeatCoordinates() ;

      };
    });
  });

  // Release the seat when the mouse is up
  document.addEventListener("mouseup", () => {
    document.onmousemove = null; // Reset the mousemove event when the mouse is up
  });
};





  await fetchCurrentSeatMap(hashedCid);

//function to print the coordinate of the seat
  function printSeatCoordinates() {
    const seats = document.querySelectorAll('.seat');
  
    seats.forEach((seat) => {
      const seatNumber = seat.innerText;
      const xCoordinate = seat.offsetLeft + seat.offsetWidth / 2;
      const yCoordinate = seat.offsetTop + seat.offsetHeight / 2;
  
      console.log(`Seat ${seatNumber}: (${xCoordinate}, ${yCoordinate})`);
    });
  } 


printSeatCoordinates() ;