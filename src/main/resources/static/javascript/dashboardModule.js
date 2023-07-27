import { DEFAULT_SEATMAP } from './SEATMAP.js';
import { postDefaultSeatmap } from './attendanceController.js';

/*
  THIS CLASS IS USED TO PREVENT WHEN USER START CLASS OR ATTENDCLASS 
  WITH NO DEFAULT STRUCTURE, THE SCREEN WOULD BE BLANK
  IT IS CALLED IN student/dashboard.html AND teacher/dashboard.html
*/

let teacherId = document.querySelector('#hashedTeacherId');
let studentId = document.querySelector('#studentHashedId');
let userId;
if (teacherId) {
  userId = teacherId.value.trim();
}
if (studentId) {
  userId = studentId.value.trim();
}

async function fetchDefaultSeatMap(hashedClassId) {
    try {
        const url = `/ficcheck/api/classroom/GET/defaultSeatMap/${hashedClassId}`
        const response = await fetch(url);
    
        // Check the response status to handle different scenarios
        if (response.status === 200) {
          const responseBody = await response.text();
          if (responseBody === "none") {
            // Seat map data is not available, use default seat map
            postDefaultSeatmap(DEFAULT_SEATMAP, hashedClassId);
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
  When teacher press start a class it will check if that class has a default seat map
  if yes -> save it to current seat map
  if not then post up default map
*/
document.querySelectorAll(".startClass").forEach(function(element) {
    element.addEventListener("click", function(event) {
      event.preventDefault(); // Prevent the default link behavior
  
      // Retrieve the hashedCid from the data attribute of the clicked element
      const hashedCid = element.dataset.hashedCid.trim();
  
      // Fetch the default seat map
      fetchDefaultSeatMap(hashedCid)
        .then(() => {
          // Redirect to the specified URL after the changes are saved
          if (teacherId) {
            window.location.href = `/teacher/${userId}/courseStart/${hashedCid}`;
          }
          if (studentId) {
            window.location.href = `/student/${userId}/courseStart/${hashedCid}`;
          }
        })
        .catch((error) => {
          // Handle any errors that occur during the request or fetch
          console.error("An error occurred while updating the course:", error);
        });
    });
  });


if (teacherId) {
  /*
    IF IT IS THE TEACHER USER, THEN THEY CAN ACCESS EDITSEATMAP
  */
  document.querySelectorAll(".editSeatMap").forEach(function(element) {
    element.addEventListener("click", function(event) {
      event.preventDefault(); // Prevent the default link behavior
  
      // Retrieve the hashedCid from the data attribute of the clicked element
      const hashedCid = element.dataset.hashedCid.trim();
  
      // Fetch the default seat map
      fetchDefaultSeatMap(hashedCid)
        .then(() => {
          // Redirect to the specified URL after the changes are saved
          window.location.href = `/teacher/${userId}/editSeatMap/${hashedCid}`;
        })
        .catch((error) => {
          // Handle any errors that occur during the request or fetch
          console.error("An error occurred while updating the course:", error);
        });
      });
    });
}