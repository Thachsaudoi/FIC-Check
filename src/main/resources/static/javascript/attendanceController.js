/*
  THIS CLASS IS SERVED AS A HELPER CLASS TO REDUCE REDUNDANT CODE
  these methods are imported in teacher/attendanceTaking.js and student/seatMap.js
*/
export function loadSeatMap(data, seatMap) {
  // Update seatMap object with loaded data
  seatMap.seats = data.seats;
  // Color the occupied seats and display the student name
  const seats = document.querySelectorAll('.seat');
  seats.forEach((seat) => {
    seat.style.position = 'absolute';
    const seatIndex = parseInt(seat.getAttribute('data-seat-index'));
    const { seatNumber, studentName } = seatMap.seats[seatIndex];
    seat.style.left = `${seatMap.seats[seatIndex].xCoordinate}px`;
    seat.style.top = `${seatMap.seats[seatIndex].yCoordinate}px`;
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

export async function clearCurrentSeatMap(hashedCid, stompClient) {
  /*
  Clear current Seat Map and set it to the Default one  
  USAGE: 
  Param: hashedCid -> hashed class id of the class you want to clear seat map
  Used when teacher presses go back or goes out of the attendance taking.
  */
  try {
    const response = await fetch('/ficcheck/api/classroom/POST/clearSeatMap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        hashedCid: hashedCid
      })
    });
  
    if (response.ok) {
      // Send to students the class ended
      if (stompClient) {
        let sendData = {
          type: "ClearOutMap",
          hashedCid: hashedCid
        }
        stompClient.send(
          "/app/classroom.attendance/" + hashedCid,
          {},
          JSON.stringify(sendData)
        );
      }
    } else {
      // Handle the error case
      console.error('Request failed with status:', response.status);
    }
  } catch (error) {
    // Handle any other errors that occurred during the fetch or processing
    console.error('Error:', error);
  }  
}
