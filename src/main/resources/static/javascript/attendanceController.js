import { DEFAULT_SEATMAP } from './DefaultSeatMap.js';

const seatMap = {
    seats: []
};
  
export async function fetchDefaultSeatMap(hashedCid, stompClient) {
    try {
        const response = await fetch(`/ficcheck/api/classroom/GET/defaultSeatMap/${hashedCid}`);
    
        // Check the response status to handle different scenarios
        if (response.status === 200) {
          const responseBody = await response.text();
          if (responseBody === "none") {
            // Seat map data is not available, use default seat map
            postDefaultSeatmap(DEFAULT_SEATMAP, hashedCid);
            saveCurrentSeatMap(DEFAULT_SEATMAP, hashedCid, stompClient);
          } else {
            // Default seat map data is available
            const data = JSON.parse(responseBody);
            console.log('Seat Map:');
            console.log(data.seats);
            saveCurrentSeatMap(data, hashedCid, stompClient); //Save to the current seat map database
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
export async function fetchCurrentSeatMap(hashedCid, stompClient) {
    try {
        const response = await fetch(`/ficcheck/api/classroom/GET/currentSeatMap/${hashedCid}`);
    
        // Check the response status to handle different scenarios
        if (response.status === 200) {
          const responseBody = await response.text();
          if (responseBody === "none") {
            // Seat map data is not available, use default seat map
            postDefaultSeatmap(DEFAULT_SEATMAP);
            saveCurrentSeatMap(DEFAULT_SEATMAP, hashedCid, stompClient);
          } else {
            // Default seat map data is available
            const data = JSON.parse(responseBody);
            console.log("DAWKDJAWKDJAWKLDJKALWDJK")
            console.log("DUMA"+data.seats)
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
/*
  save seatMap everytime there is changes to the seatmap
  */
export async function saveCurrentSeatMap(updatedSeatMap, hashedCid, stompClient) {
    try {
        console.log("DUMAAA HREEeEE: " + hashedCid)

    const response = await fetch(`/ficcheck/api/classroom/POST/currentSeatMap/${hashedCid}`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSeatMap),
    });

    if (response.ok) {
        stompClient.send("/app/chat.sendSelectedSeat/" + hashedCid, {},JSON.stringify(seatMap));
        
    } else {
        console.error('Error:', response.status);
    }
    } catch (error) {
    console.error('Error:', error);
    }
}

export async function postDefaultSeatmap(updatedSeatMap, hashedCid) {
    try {
        console.log("DUMAAA: " + hashedCid)

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
    console.log("the data is")
    console.log(data.seats);
        // Update seatMap object with loaded data
        seatMap.seats = data.seats;
    
        // Color the occupied seats and display the student name
    const seats = document.querySelectorAll('.seat');
    seats.forEach((seat) => {
      const seatIndex = parseInt(seat.getAttribute('data-seat-index'));
      const { seatNumber, studentName } = seatMap.seats[seatIndex];
      console.log("DUMA SEAT INDEX:")
      console.log(seatIndex);
      if (studentName !== '') {
        seat.classList.add('occupied');
        seat.innerText = `${seatNumber} - ${studentName}`;
      }
    });
    
}
  //total number of seat 
  const totalSeats = 48; 
  
  for (let i = 1; i <= totalSeats; i++) {
    seatMap.seats.push({
      seatNumber: String(i),
      studentName: ''
    });
  }

  let selectedSeatElement = null;
  console.log("DIT CONE ME MAY "+selectedSeatElement)

function checkedInStudent(studentEmail) {
  console.log("DUMA DIT ME")
  for (const seat of seatMap.seats) {
    console.log(seat.studentEmail);
    if (seat.studentEmail === studentEmail) {
      selectedSeatElement = parseInt(seat.seatNumber, 10) - 1; 
    }
  }
}
export function generateSeatMap(studentName, studentEmail, hashedCid, stompClient) {
  
  checkedInStudent(studentEmail)
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
                  seatMap.seats[seatIndex].studentName = studentName;
                  seatMap.seats[seatIndex].studentEmail = studentEmail;
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
              // Select a new seat
              if (confirm("Check in this seat? ")) {
                seatMap.seats[seatIndex].studentName = studentName;
                seatMap.seats[seatIndex].studentEmail = studentEmail;
                event.target.innerText = seatMap.seats[seatIndex].seatNumber + ' - ' + studentName;
                event.target.classList.add('selected');
                selectedSeatElement = event.target;
                saveCurrentSeatMap(seatMap, hashedCid, stompClient)
              }
            
            }
          }
        });
  
        lineElement.appendChild(seatElement);
      }
  
      seatMapContainer.appendChild(lineElement);
    }
  }
  
