'use strict';
import {saveCurrentSeatMap, loadSeatMap, postDefaultSeatmap } from '../attendanceController.js';
import { DEFAULT_SEATMAP } from '../SEATMAP.js';

let hashedCid = document.querySelector('#hashedCid').value.trim();
const seatMap = {
  seats: []
};

document.addEventListener("DOMContentLoaded", async function(event) {
  //If teacher refresh the page, it will connect again
  fetchCurrentSeatMap(hashedCid);
});


async function fetchCurrentSeatMap(hashedCid) {
  try {
      const response = await fetch(`/ficcheck/api/classroom/GET/currentSeatMap/${hashedCid}`);
      // Check the response status to handle different scenarios
      if (response.status === 200) {
        const responseBody = await response.text();
        if (responseBody === "none") {
          // Seat map data is not available, post default seatmap up
          postDefaultSeatmap(DEFAULT_SEATMAP, hashedCid);
        } else {
          // if find an already existed seatMap then use that data from backend
          const data = JSON.parse(responseBody);
          generateSeatMap(data);
          await loadSeatMap(data, seatMap);
          updateSeatNumber() ;
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



  function createXButton(seatIndex) {
    const xButton = document.createElement('button');
    xButton.classList.add('xButton');
    xButton.innerText = '\u00D7';

    xButton.addEventListener('click', () => {
      deleteSeat(seatIndex); 
    });

    return xButton;
  }



  function generateSeatMap(data) {



    const seatMapContainer = document.getElementById('seatMapContainer');
    seatMapContainer.innerHTML = '';
    let seats = data.seats
    console.log(seats) ;


    for (let i =0 ;  i <seats.length ; i++) {

        const seatIndex = i ; 
        const seatElement = document.createElement('div');
        seatElement.classList.add('seat');
        seatElement.innerText = seats[seatIndex].seatNumber;
        seatElement.setAttribute('data-seat-index', seatIndex);

      

        // Set the position of the seat based on the coordinates from the DEFAULT_SEATMAP
        seatElement.style.position = 'absolute';
        seatElement.style.left = seats[seatIndex].xPercentage + "%";
        seatElement.style.top = seats[seatIndex].yPercentage + "%";

        
        // Create the xButton and add event listeners
        const xButton = createXButton(seatIndex);
        seatElement.appendChild(xButton);
        addHoverEffect(seatElement, xButton) ;
        
         seatMapContainer.appendChild(seatElement);
    }
    move() ;
    printSeatCoordinates() ;

  }


  // const move = function () {
  //   const seats = document.querySelectorAll(".seat");
  //   const container = document.getElementsByClassName('container');
  //   const containerRect = seatMapContainer.getBoundingClientRect();


  
  //   seats.forEach((seat) => {
  //     seat.addEventListener("mousedown", (e) => {
  //       // Prevent text selection while dragging
  //       e.preventDefault();
  
  //      // Get the initial position of the seat relative to the entire document
  //      const rect = seat.getBoundingClientRect();
  //      const centerX = rect.left + rect.width / 2;
  //      const centerY = rect.top + rect.height / 2;
  //      const offsetX = e.clientX - centerX;
  //      const offsetY = e.clientY - centerY;

  //       document.onmousemove = (e) => {
  //         const x = e.pageX - offsetX;
  //         const y = e.pageY - offsetY;

  //         seat.style.left = x -25 + "px";
  //         seat.style.top = y -240 + "px";
          
  
  //         // Update the seatMap with the new coordinates
  //         const seatIndex = parseInt(seat.getAttribute("data-seat-index"));
  //         seatMap.seats[seatIndex].xCoordinate = x  - 25;
  //         seatMap.seats[seatIndex].yCoordinate = y  -240 ; // Adjusting for the offset

      
  //       };
  //     });
  //   });
  
  //   // Release the seat when the mouse is up
  //   document.addEventListener("mouseup", () => {
  //     document.onmousemove = null; // Reset the mousemove event when the mouse is up
  //   });
  // };
  

  const move = function () {
    const seats = document.querySelectorAll(".seat");
    const container = document.getElementsByClassName('container')[0]; // Use [0] to access the first element of the collection
  
    // Helper function to convert pixel coordinates to percentage
    const convertToPercentage = (x, y) => {
      const containerRect = container.getBoundingClientRect();
      const xPercentage = ((x - containerRect.left) / containerRect.width) * 100;
      const yPercentage = ((y - containerRect.top) / containerRect.height) * 100;
      return { xPercentage, yPercentage };
    };
  
    seats.forEach((seat) => {
      seat.addEventListener("mousedown", (e) => {
        // Prevent text selection while dragging
        e.preventDefault();
  
        // Get the initial position of the seat relative to the container
        const rect = seat.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;
  
        document.onmousemove = (e) => {
          // Calculate the new percentage coordinates based on the current container size
          const { xPercentage, yPercentage } = convertToPercentage(e.pageX - offsetX, e.pageY - offsetY);
  
          // Update the seat position using percentage values
          seat.style.left = xPercentage + "%";
          seat.style.top = yPercentage + "%";
  
          // Update the seatMap with the new coordinates
          const seatIndex = parseInt(seat.getAttribute("data-seat-index"));
          seatMap.seats[seatIndex].xPercentage = xPercentage;
          seatMap.seats[seatIndex].yPercentage = yPercentage;
        };
      });
    });
  
    // Release the seat when the mouse is up
    document.addEventListener("mouseup", () => {
      document.onmousemove = null; // Reset the mousemove event when the mouse is up
      printSeatCoordinates();
    });
  
    // Update the seat positions when the window is resized
    window.addEventListener("resize", () => {
      seats.forEach((seat) => {
        const seatIndex = parseInt(seat.getAttribute("data-seat-index"));
        const xPercentage = seatMap.seats[seatIndex].xPercentage;
        const yPercentage = seatMap.seats[seatIndex].yPercentage;
  
        // Convert percentage coordinates to pixels based on the current container size
        const containerRect = container.getBoundingClientRect();
        const xPixel = (containerRect.width * xPercentage) / 100;
        const yPixel = (containerRect.height * yPercentage) / 100;
  
        // Update the seat position using pixel values
        seat.style.left = xPixel + "px";
        seat.style.top = yPixel + "px";
      });
    });
  };
  

  /*
    parameter : no parameter needed
    precondition : have seat element on the html 
    postcondition : it will output the coordinate of the seat
  */

  function printSeatCoordinates() {
    const seats = document.querySelectorAll('.seat');
    const seatMapContainer = document.querySelector('.container');
    const containerRect = seatMapContainer.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
  
    seats.forEach((seat) => {
      const seatNumber = seat.innerText;
  
      // Calculate the percentage coordinates of the seat
      const xPercentage = (seat.offsetLeft / containerWidth) * 100;
      const yPercentage = (seat.offsetTop / containerHeight) * 100;
  
      console.log(`Seat ${seatNumber}: (${xPercentage.toFixed(2)}%, ${yPercentage.toFixed(2)}%)`);
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

  Swal.fire({
    position: 'position',
    icon: 'success',
    title: 'Changes had been saved!',
    showConfirmButton: false,
    timer: 1500
  })




  saveCurrentSeatMap(seatMap, null, hashedCid);
});





// function addSeat() {

//     const seatMapContainer = document.getElementById('seatMapContainer');
//     const newSeatElement = document.createElement('div');
//     newSeatElement.classList.add('seat');
//     newSeatElement.innerText = seatMap.seats.length + 1;
//     newSeatElement.setAttribute('data-seat-index', seatMap.seats.length);
  
//     // Set the initial coordinates of the seat based on its position when added
    
  
//     const xCoordinate =200;
//     const yCoordinate =  540;


//       seatMap.seats.push({
//         seatNumber: String(seatMap.seats.length+1 ),
//         studentName: '', 
//         studentEmail: '', 
//         xCoordinate : xCoordinate,
//         yCoordinate: yCoordinate,
        

//       });

//     //Set the position of the seat appear when the seat is added
//     newSeatElement.style.position = 'absolute';
//     newSeatElement.style.left = `${xCoordinate}px`; // X-coordinate
//     newSeatElement.style.top = `${yCoordinate}px`; // Y-coordinate


    

//     //add X button to the seat 
//     var xButton = createXButton() ;
//     newSeatElement.appendChild(xButton) ;

//     addHoverEffect(newSeatElement, xButton) ;

   
    
//     // Append the new seat to the container
//     seatMapContainer.appendChild(newSeatElement);

   
//     // Make the new seat moveable
//     updateAndSaveSeatMap(seatMap);
//     move() ;
    
  
// }

function addSeat() {

  const seatMapContainer = document.getElementById('seatMapContainer');
  const newSeatElement = document.createElement('div');
  newSeatElement.classList.add('seat');
  newSeatElement.innerText = seatMap.seats.length + 1;
  newSeatElement.setAttribute('data-seat-index', seatMap.seats.length);

  // Set the initial coordinates of the seat based on its position when added
  

  const xPercentage = 11.22 ; 
  const yPercentage = 81.24 ; 


    seatMap.seats.push({
      seatNumber: String(seatMap.seats.length+1 ),
      studentName: '', 
      studentEmail: '', 
      xPercentage : xPercentage,
      yPercentage: yPercentage,
      

    });

  //Set the position of the seat appear when the seat is added
  newSeatElement.style.position = 'absolute';
  newSeatElement.style.left = `${xPercentage}%` ;
  newSeatElement.style.top = `${yPercentage}%` ;

  

  //add X button to the seat 
  var xButton = createXButton() ;
  newSeatElement.appendChild(xButton) ;

  addHoverEffect(newSeatElement, xButton) ;

 
  
  // Append the new seat to the container
  seatMapContainer.appendChild(newSeatElement);

 
  // Make the new seat moveable
  updateAndSaveSeatMap(seatMap);
  move() ;
  

}

function updateAndSaveSeatMap(seatMap) {
    updateSeatNumber();
    saveCurrentSeatMap(seatMap, null, hashedCid) ;
    generateSeatMap(seatMap) ;
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
  
        updateAndSaveSeatMap(seatMap);
    
        printSeatCoordinates();
      }
    }
  }



// Add event listener to the "Add seat" button
const addSeatButton = document.getElementById('addSeat');
addSeatButton.addEventListener('click', addSeat);

printSeatCoordinates() ;
updateSeatNumber();