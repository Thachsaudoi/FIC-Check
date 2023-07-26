'use strict';
import { DEFAULT_SEATMAP } from '../SEATMAP.js';

let userName = document.querySelector('#teacherName').value.trim();
let hashedCid = document.querySelector('#hashedCid').value.trim();
console.log(hashedCid);


const totalSeats = 48;
const seatMap = {
  seats: []
};


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
            console.log("DUMAAAAA");
            // TODO: Find out why the map doesn't load, the thing currently get into this function.
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
          console.log("updated default seat map")
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
