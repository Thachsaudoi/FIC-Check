// Step 1: Create the seatMap object
const seatMap = {
    seats: [
      { seatNumber: '1', studentName: '' },
      { seatNumber: '2', studentName: '',},
      { seatNumber: '3', studentName: '',},
      { seatNumber: '4', studentName: '',},
      { seatNumber: '5', studentName: '',},
      { seatNumber: '6', studentName: '',},
      { seatNumber: '7', studentName: '',},
      { seatNumber: '8', studentName: '',},
      { seatNumber: '9', studentName: '',},
      { seatNumber: '10', studentName: '',},
      { seatNumber: '11', studentName: '',},
      { seatNumber: '12', studentName: '',},
      { seatNumber: '13', studentName: '',},
      { seatNumber: '14', studentName: '',},
      { seatNumber: '15', studentName: '',},
      { seatNumber: '16', studentName: '',},
      { seatNumber: '17', studentName: '',},
      { seatNumber: '18', studentName: '',},
      { seatNumber: '19', studentName: '',},
      { seatNumber: '20', studentName: '',},
      { seatNumber: '21', studentName: '',},
      { seatNumber: '22', studentName: '',},
      { seatNumber: '23', studentName: '',},
      { seatNumber: '24', studentName: '',},
      { seatNumber: '25', studentName: '',},
      { seatNumber: '26', studentName: '',},
      { seatNumber: '27', studentName: '',},
      { seatNumber: '28', studentName: '',},
      { seatNumber: '29', studentName: '',},
      { seatNumber: '30', studentName: '',},
      { seatNumber: '31', studentName: '',},
      { seatNumber: '32', studentName: '',},
      { seatNumber: '33', studentName: '',},
      { seatNumber: '34', studentName: '',},
      { seatNumber: '35', studentName: '',},
      { seatNumber: '36', studentName: '',},
      { seatNumber: '37', studentName: '',},
      { seatNumber: '38', studentName: '',},
      { seatNumber: '39', studentName: '',},
      { seatNumber: '40', studentName: '',},
      { seatNumber: '41', studentName: '',},
      { seatNumber: '42', studentName: '',},
      { seatNumber: '43', studentName: '',},
      { seatNumber: '44', studentName: '',},
      { seatNumber: '45', studentName: '',},
      { seatNumber: '46', studentName: '',},
      { seatNumber: '47', studentName: '',},
      { seatNumber: '48', studentName: '',},
    ]
  };
  

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
            console.log("this is the selected seat : " + selectedSeatElement);
          const seatIndex = parseInt(event.target.getAttribute('data-seat-index'));
  
          if (seatMap.seats[seatIndex].studentName !== '') {
            // Seat is already selected, display a message
            Swal.fire('Seat Already Selected', 'Seat is already taken.', 'info');
          } else {
            // Deselect the previously selected seat, if any
            if (selectedSeatElement != null) {
              
              Swal.fire({
                title: 'Confirm seat change',
                text : 'Are you sure you want to change you seat ?',
                showDenyButton: true,
                confirmButtonText: 'Yes',
                denyButtonText: `No`,
                icon : 'question'
              }).then((result) => {
                if (result.isConfirmed) {
                    //remove previous seat selection
                    const selectedSeatIndex = parseInt(selectedSeatElement.getAttribute('data-seat-index'));
                    seatMap.seats[selectedSeatIndex].studentName = '';
                    seatMap.seats[selectedSeatIndex].studentEmail = '';
                    selectedSeatElement.innerText = seatMap.seats[selectedSeatIndex].seatNumber;
                    selectedSeatElement.classList.remove('selected');


                    //select a new seat 
                    const studentName = prompt('Enter student name:');
                    const studentEmail = prompt('Enter student email:');
                    seatMap.seats[seatIndex].studentName = studentName;
                    seatMap.seats[seatIndex].studentEmail = studentEmail;
                    event.target.innerText = seatMap.seats[seatIndex].seatNumber + ' - ' + studentName;
                    event.target.classList.add('selected');
                    selectedSeatElement = event.target;
                    Swal.fire('Seat Change Confirmed', 'Your seat has been successfully updated. Please check the updated seatmap for your new assigned seat.', 'success')
                } else if (result.isDenied) {
                  Swal.fire('Seat Change Cancelled', 'Your seat change request has been cancelled. Your current seat assignment will remain unchanged.  ', 'info')
                }
              })
            }
            else{ 

                //select a new seat
                const studentName = prompt('Enter student name:');
                const studentEmail = prompt('Enter student email:');
                seatMap.seats[seatIndex].studentName = studentName;
                seatMap.seats[seatIndex].studentEmail = studentEmail;
                event.target.innerText = seatMap.seats[seatIndex].seatNumber + ' - ' + studentName;
                event.target.classList.add('selected');
                selectedSeatElement = event.target;

            }
            
            
          }
        });
  
        lineElement.appendChild(seatElement);
      }
  
      seatMapContainer.appendChild(lineElement);
    }
  }
  
//   // Function to load the seat map from JSON file
//   async function loadSeatMap() {
//     try {
//       const response = await fetch('seatMap.json');
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
    


  
  
  // Function to save the seatMap object as a JSON file
  function saveSeatMap() {
    const jsonString = JSON.stringify(seatMap);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const downloadUrl = URL.createObjectURL(blob);
  
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'seatMap.json';
    link.click();
  }
  

  // Generate the initial seat map and load the data
generateSeatMap();
//  loadSeatMap();