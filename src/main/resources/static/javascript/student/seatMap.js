var socket = new SockJS('/ws');
var stompClient = Stomp.over(socket);
let hashedCid = document.querySelector('#hashedCid').value.trim();
// Connect to the WebSocket server
stompClient.connect({}, onConnected, onError);


// Handle error in WebSocket connection
function onError(error) {

    console.error("Error connecting to WebSocket server:", error);
}


// document.addEventListener("DOMContentLoaded", (event) => {
//   if (isLive) {
//       connect(event);
//   }
// })



function onConnected() {
  // Subscribe to the Public Topic
  stompClient.subscribe('/topic/' + hashedCid + '/public', onMessageReceived);
  // Tell your username to the server
  // Before connecting to the WebSocket
  let data = {
      sender: "userName",
      type: 'StartAttendance',
      hashedCid: hashedCid
  }
  stompClient.send("/app/chat.addUser/" + hashedCid,
      {},
      JSON.stringify(data)
  );

}

function sendSelectedSeat() {

    if(stompClient) {
        saveSeatMapToJson();
        stompClient.send("/app/chat.sendSelectedSeat", {},JSON.stringify(seatMap));
    }
}
function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);

    var messageElement = document.createElement('li');

    if(message.type === 'StartAttendance') {
        messageElement.classList.add('event-message');
        messageElement.textContent = message.sender + ' joined!';
    }
    else if (message.type === 'StopAttendance') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' left!';
        stompClient.disConnect();
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
  
                  sendSelectedSeat();
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
              sendSelectedSeat();
            }
          }
        });
  
        lineElement.appendChild(seatElement);
      }
  
      seatMapContainer.appendChild(lineElement);
    }
  }
  
  
  
//   //Load the seat Map base on json file
//   async function loadSeatMap() {
//     try {
//       const response = await fetch(`/ficcheck/api/classroom/POST/seatMap/${hashedCid}`, {
//         method: '',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(seatMap),
//       });
//       const data = await response.json();
  
//       // Update seatMap object with loaded data
//       seatMap.seats = data.seats;
  
//       // Color the occupied seats and display the student name
//       const seats = document.querySelectorAll('.seat');
//       seats.forEach((seat) => {
//         const seatIndex = parseInt(seat.getAttribute('data-seat-index'));
//         const { seatNumber, studentName } = seatMap.seats[seatIndex];
//         if (studentName !== '') {
//           seat.classList.add('occupied');
//           seat.innerText = `${seatNumber} - ${studentName}`;
//         }
//       });
//     } catch (error) {
//       console.error('Error loading seat map:', error);
//     }
//   }
async function loadSeatMap() {
    try {
      const response = await fetch('/seatMap.json');
      const data = await response.json();
  
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
    } catch (error) {
      console.error('Error loading seat map:', error);
    }
  }



  /*
  save seatMap everytime there is changes to the seatmap
  */
  async function saveSeatMapToJson() {
    try {
        const response = await fetch(`/ficcheck/api/classroom/POST/seatMap/${hashedCid}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(seatMap),
        });
    
        if (response.ok) {
          console.log('Seat map updated successfully');
        } else {
          console.error('Error:', response.status);
        }
      } catch (error) {
        console.error('Error:', error);
      }
  }





  // Generate the initial seat map and load the data
generateSeatMap();
loadSeatMap();