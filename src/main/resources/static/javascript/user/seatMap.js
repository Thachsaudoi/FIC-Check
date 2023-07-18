
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
  
                  saveSeatMapToJson();
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
              saveSeatMapToJson();
            }
          }
        });
  
        lineElement.appendChild(seatElement);
      }
  
      seatMapContainer.appendChild(lineElement);
    }
  }
  
  
  
  //Load the seat Map base on json file
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
      const jsonString = JSON.stringify(seatMap);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const downloadUrl = URL.createObjectURL(blob);
  
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'seatMap.json';
      link.click();
    } catch (error) {
      console.error('Error saving seat map:', error);
    }
  }





  // Generate the initial seat map and load the data
generateSeatMap();
loadSeatMap();
