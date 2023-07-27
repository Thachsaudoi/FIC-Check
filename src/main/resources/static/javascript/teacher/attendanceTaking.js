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
    var seatMap = 
    console.log("coordinate in DOM content loaded") ; 
    printSeatCoordinates();
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
              console.log(data)
              await generateSeatMap(data);
              await loadSeatMap(data);
              move();
              console.log("print data in fetch current seatMap") ;
              console.log(data) ;
              
              
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
      if (stompClient) {
        stompClient.send("/app/classroom.sendSelectedSeat/" + hashedCid, {},JSON.stringify(seatMap));
      }
      console.log("OK");
        
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
            console.log("updated default seat map")
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
      seat.style.left = `${seatMap.seats[seatIndex].xCoordinate}px`;
      seat.style.top = `${seatMap.seats[seatIndex].yCoordinate}px`;
      if (studentName !== '') {
        seat.classList.add('occupied');
        seat.innerText = `${seatNumber} - ${studentName}`;
      }
    });
  }


  function createXButton(seatIndex) {
    const xButton = document.createElement('button');
    xButton.classList.add('xButton');
    xButton.innerText = 'X';

    // Add event listener to the X button to delete the seat
    xButton.addEventListener('click', () => {
      deleteSeat(seatIndex); //TODO: create this function 
    });

    return xButton;
  }



  function generateSeatMap(data) {
    const seatMapContainer = document.getElementById('seatMapContainer');
    seatMapContainer.innerHTML = '';
    let seats = data.seats


    for (let i =0 ;  i <seats.length ; i++) {
      const lineElement = document.createElement('div');
      lineElement.classList.add('line');

        const seatIndex = i ; 
        const seatElement = document.createElement('div');
        seatElement.classList.add('seat');
        seatElement.innerText = seats[seatIndex].seatNumber;
        seatElement.setAttribute('data-seat-index', seatIndex);

      

        // Set the position of the seat based on the coordinates from the DEFAULT_SEATMAP
        seatElement.style.position = 'absolute';
        seatElement.style.left = `${seats[seatIndex].xCoordinate}px`;
        seatElement.style.top = `${seats[seatIndex].yCoordinate}px`;

        
        // Create the xButton and add event listeners
        const xButton = createXButton(seatIndex);
        seatElement.appendChild(xButton);

        addHoverEffect(seatElement, xButton) ;
        

        lineElement.appendChild(seatElement);



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
  

          seat.style.left = x +10+ "px";
          seat.style.top = y - 150 + "px";
  
          // Update the seatMap with the new coordinates
          const seatIndex = parseInt(seat.getAttribute("data-seat-index"));
          seatMap.seats[seatIndex].xCoordinate = x;
          seatMap.seats[seatIndex].yCoordinate = y - 150; // Adjusting for the offset
        };
      });
    });
  
    // Release the seat when the mouse is up
    document.addEventListener("mouseup", () => {
      document.onmousemove = null; // Reset the mousemove event when the mouse is up
    });
  };
  



  /*
    parameter : no parameter needed
    precondition : have seat element on the html 
    postcondition : it will output the coordinate of the seat
  */

    function printSeatCoordinates() {
      const seats = document.querySelectorAll('.seat');
    
      seats.forEach((seat) => {
        const seatNumber = seat.innerText;
        const xCoordinate = seat.offsetLeft + seat.offsetWidth / 2;
        const yCoordinate = seat.offsetTop + seat.offsetHeight / 2;
    
        console.log(`Seat ${seatNumber}: (${xCoordinate}, ${yCoordinate})`);
      });
      
    } 



    /*
    precondition: 1) seatElement (div) ,2) xButton(div)  
    postcondition : create a hover effect
    */
    
    function addHoverEffect(seatElement, xButton) {
      // Set the initial display style of the x button to none
      xButton.style.display = 'none';
    
      seatElement.addEventListener('mouseenter', () => {
        // Show the X button when the mouse enters the seat element
        xButton.style.display = 'block';
      });
    
      seatElement.addEventListener('mouseleave', () => {
        // Hide the X button when the mouse leaves the seat element
        xButton.style.display = 'none';
      });
    }


    


/*
  !!MUST CLICK THE SAVE BUTTON TO SAVE THE CHANGES IN THE COORDINATES
*/
const saveSeatButton = document.getElementById('saveSeat');
saveSeatButton.addEventListener('click', () => {
  saveCurrentSeatMap(seatMap);
});





function addSeat() {

    const seatMapContainer = document.getElementById('seatMapContainer');
    const newSeatElement = document.createElement('div');
    newSeatElement.classList.add('seat');
    newSeatElement.innerText = seatMap.seats.length + 1;
    newSeatElement.setAttribute('data-seat-index', seatMap.seats.length);
  
    // Set the initial coordinates of the seat based on its position when added
    
  
    const xCoordinate = 1000;
    const yCoordinate =  600;

      seatMap.seats.push({
        seatNumber: String(seatMap.seats.length+1 ),
        studentName: '', 
        studentEmail: '', 
        xCoordinate : xCoordinate,
        yCoordinate: yCoordinate,
        

      });

    //Set the position of the seat appear when the seat is added
    newSeatElement.style.position = 'absolute';
    newSeatElement.style.left =  '1000px'; //X-coordinate 
    newSeatElement.style.top = '600px';  // Y-coordinate

    //add X button to the seat 
    var xButton = createXButton() ;
    newSeatElement.appendChild(xButton) ;

    addHoverEffect(newSeatElement, xButton) ;


    // Append the new seat to the container
    seatMapContainer.appendChild(newSeatElement);
    // Make the new seat moveable
    move();
    updateSeatNumber();
    saveCurrentSeatMap(seatMap) ;
    generateSeatMap(seatMap) ;
    console.log("data in addSeat function");
    console.log(seatMap);

}



  function updateSeatNumber() {
    const seatNumberDiv = document.getElementById('seatNumber');
    seatNumberDiv.textContent = `Number of Seats: ${document.querySelectorAll('.seat').length}`;
  }


  function deleteSeat(seatIndex) {
    const seatElement = document.querySelector(`[data-seat-index="${seatIndex}"]`);
    if (seatElement) {
      // Find the index of the seat in the seatMap
      const seatMapIndex = seatMap.seats.findIndex((seat) => seat.seatNumber === String(seatIndex + 1));
      if (seatMapIndex !== -1) {
        // Remove the seat from the DOM
        seatElement.remove();
  
        // Remove the seat from the seatMap object
        seatMap.seats.splice(seatMapIndex, 1);
  
        // Get the remaining seats after deletion
        const seats = document.querySelectorAll('.seat');
  
        // Update seat numbers in the remaining seats and their data-seat-index attributes
        seats.forEach((seat, index) => {
          const newSeatIndex = index + 1;
          seat.innerText = newSeatIndex;
          seat.setAttribute('data-seat-index', index);
          seatMap.seats[index].seatNumber = String(newSeatIndex);
        });
  
        // Update seat number
        updateSeatNumber();
  
        // Save the updated seat map
        saveCurrentSeatMap(seatMap);

        generateSeatMap(seatMap);
      }
    }
  }



  // Add event listener to the "Add seat" button
  const addSeatButton = document.getElementById('addSeat');
  addSeatButton.addEventListener('click', addSeat);


  await fetchCurrentSeatMap(hashedCid);
  printSeatCoordinates() ;
  updateSeatNumber();








   


  /*
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
  */


  /* this is a zombie code, if not use just delete it */

  // const move = function () {
  //   const seats = document.querySelectorAll(".seat");

  //   seats.forEach((seat) => {
  //     seat.addEventListener("mousedown", (e) => {
  //       // Prevent text selection while dragging
  //       e.preventDefault();

  //       // Get the initial position of the seat relative to the entire document
  //       const rect = seat.getBoundingClientRect();
  //       const offsetX = e.clientX - rect.left;
  //       const offsetY = e.clientY - rect.top;

  //       document.onmousemove = (e) => {
  //         const x = e.pageX - offsetX;
  //         const y = e.pageY - offsetY;

  //         // Move the seat to the new position
  //         seat.style.left = x  + "px";
  //         seat.style.top = y -150+ "px";


  //         console.log(printSeatCoordinates() ) ;
        

  //       };
  //     });
  //   });

  //   // Release the seat when the mouse is up
  //   document.addEventListener("mouseup", () => {
  //     document.onmousemove = null; // Reset the mousemove event when the mouse is up
  //   });
  // };