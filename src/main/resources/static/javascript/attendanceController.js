/*
  THIS CLASS IS SERVED AS A HELPER CLASS TO REDUCE REDUNDANT CODE
  these methods are imported in teacher/attendanceTaking.js and student/seatMap.js
*/

export async function loadSeatMap(data, seatMap) {
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


export async function saveCurrentSeatMap(updatedSeatMap, stompClient, hashedCid) {
  /*
    save seatMap everytime there is changes to the seatmap
  */
  try {
  const response = await fetch(`/ficcheck/api/classroom/POST/currentSeatMap/${hashedCid}`, {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedSeatMap),
  });

  if (response.ok) {
    if (stompClient) {
      //If there is a websocket network then we send the selected Seat to the server
      stompClient.send("/app/classroom.sendSelectedSeat/" + hashedCid, {},JSON.stringify(updatedSeatMap));
    }
    console.log("OK")
      
  } else {
      console.error('Error:', response.status);
  }
  } catch (error) {
  console.error('Error:', error);
  }
}


export async function postDefaultSeatmap(updatedSeatMap, hashedCid) {
  /*
    post default seatMap when there is no avaiable seatmap from backend
  */
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

