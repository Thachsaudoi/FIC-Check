import { DEFAULT_SEATMAP } from '../DefaultSeatMap.js';

var socket = new SockJS('/ws');
var stompClient = Stomp.over(socket);
let hashedCid = document.querySelector('#hashedCid').value.trim();
// Connect to the WebSocket server
stompClient.connect({}, onConnected, onError);

// Handle error in WebSocket connection
function onError(error) {

    console.error("Error connecting to WebSocket server:", error);
}

document.addEventListener("DOMContentLoaded", (event) => {
    fetchSeatMap(hashedCid);
})
async function fetchSeatMap(hashedCid) {
  try {
    const response = await fetch(`/ficcheck/api/classroom/GET/seatMap/${hashedCid}`);

    // Check the response status to handle different scenarios
    if (response.status === 200) {
      const responseBody = await response.text();
      if (responseBody === "none") {
        // Seat map data is not available, use default seat map
        saveSeatMapToJson(DEFAULT_SEATMAP);
      } else {
        // Seat map data is available
        const data = JSON.parse(responseBody);
        console.log('Seat Map:');
        console.log(data.seats);
        loadSeatMap(data);
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

function onConnected() {
  // Subscribe to the Public Topic
  stompClient.subscribe('/topic/' + hashedCid + '/public', onMessageReceived);
}

// function sendSelectedSeat(seatMap) {

//     if(stompClient) {
//         saveSeatMapToJson(seatMap);
//         stompClient.send("/app/chat.sendSelectedSeat/" + hashedCid, {},JSON.stringify(seatMap));
//     }
// }
function onMessageReceived(payload) {
  console.log('Received Payload:', payload);

  try {
    const message = JSON.parse(payload.body);
    console.log('Parsed Message:', message);

    if (message.type === 'StartAttendance') {
      // Handle StartAttendance message
      console.log(`${message.sender} joined!`);
    } else if (message.type === 'StopAttendance') {
      // Handle StopAttendance message
      console.log(`${message.sender} left!`);
      stompClient.disconnect(); // Disconnect the WebSocket if needed
    } else {
      // Handle other message types
      console.log('Unknown message type:', message.type);
      console.log(hashedCid);
      console.log('Fetch seat map...');
      fetchSeatMap(hashedCid); // Fetch the seat map data
    }
  } catch (error) {
    // Handle any errors during message parsing
    console.error('Error parsing message:', error);
  }
}


const seatMap = {
    seats: []
};
  
  //total number of seat 
  const totalSeats = 48; 
  
  for (let i = 1; i <= totalSeats; i++) {
    seatMap.seats.push({
      seatNumber: String(i),
      studentName: ''
    });
  }

  let selectedSeatElement = null;

  generateSeatMap()
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
                  const studentName = prompt('Enter student name:');
                  const studentEmail = prompt('Enter student email:');
                  seatMap.seats[seatIndex].studentName = studentName;
                  seatMap.seats[seatIndex].studentEmail = studentEmail;
                  event.target.innerText = seatMap.seats[seatIndex].seatNumber + ' - ' + studentName;
                  event.target.classList.add('selected');
                  selectedSeatElement = event.target;
                  Swal.fire('Seat Change Confirmed', 'Your seat has been successfully updated. Please check the updated seatmap for your new assigned seat.', 'success');
                  saveSeatMapToJson(seatMap);
                  // maybe i can pass the in the new seat map.
                } else if (result.isDenied) {
                  Swal.fire('Seat Change Cancelled', 'Your seat change request has been cancelled. Your current seat assignment will remain unchanged.', 'info');
                }
              });
            } else {
              // Select a new seat
              const studentName = prompt('Enter student name:');
              const studentEmail = prompt('Enter student email:');
              seatMap.seats[seatIndex].studentName = studentName;
              seatMap.seats[seatIndex].studentEmail = studentEmail;
              event.target.innerText = seatMap.seats[seatIndex].seatNumber + ' - ' + studentName;
              event.target.classList.add('selected');
              selectedSeatElement = event.target;
              saveSeatMapToJson(seatMap);
            }
          }
        });
  
        lineElement.appendChild(seatElement);
      }
  
      seatMapContainer.appendChild(lineElement);
    }
  }
  
  
async function loadSeatMap(data) {
  //TODO: confirm that the data is correct
  // if not: find someway to work with the fetch data.
  console.log("the data is")
  console.log(data);
      // Update seatMap object with loaded data
      seatMap.seats = data.seats;
  
      // Color the occupied seats and display the student name
      const seats = document.querySelectorAll('.seat');
      seats.forEach((seat) => {
        const seatIndex = parseInt(seat.getAttribute('data-seat-index'));
        const { seatNumber, studentName } = seatMap.seats[seatIndex];
        if (studentName !== '') {
          seat.classList.add('occupied');
          seat.innerText = `${seatNumber} - ${studentName}`;
        }
      });
  }



  /*
  save seatMap everytime there is changes to the seatmap
  */
  async function saveSeatMapToJson(updatedSeatMap) {
    try {
        const response = await fetch(`/ficcheck/api/classroom/POST/seatMap/${hashedCid}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedSeatMap),
        });
    
        if (response.ok) {
          console.log('Seat map updated successfully');
          stompClient.send("/app/chat.sendSelectedSeat/" + hashedCid, {},JSON.stringify(seatMap));
          
        } else {
          console.error('Error:', response.status);
        }
      } catch (error) {
        console.error('Error:', error);
      }
  }





  // Generate the initial seat map and load the data
 