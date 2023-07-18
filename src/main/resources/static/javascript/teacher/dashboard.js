import { DEFAULT_SEATMAP } from '../DefaultSeatMap.js';
let hashedTeacherId = document.querySelector('#hashedTeacherId').value.trim();

function setContainerHeight() {
    var container = document.getElementById('container');
    var screenHeight = window.innerHeight;
    var containerHeight = screenHeight - 38;
    container.style.height = containerHeight + 'px';
}

window.addEventListener('resize', setContainerHeight);
setContainerHeight();

/* 
  When teacher press start a class it will check if that class has a default seat map
  if yes -> save it to current seat map
  if not then post up default map
*/
document.querySelectorAll(".start-form").forEach(function(form) {
    form.addEventListener("submit", function(event) {
      event.preventDefault(); // Prevent the default form submission
  
      // Retrieve the hashedCid from the data attribute of the clicked form
      const hashedCid = form.dataset.hashedCid.trim();
  
      // Fetch the default seat map
      fetchDefaultSeatMap(hashedCid)
        .then(() => {
          // Redirect to the specified URL after the changes are saved
          window.location.href = `/teacher/${hashedTeacherId}/courseStart/${hashedCid}`;
        })
        .catch((error) => {
          // Handle any errors that occur during the request or fetch
          console.error("An error occurred while updating the course:", error);
        });
    });
  });

async function fetchDefaultSeatMap(hashedClassId) {
    try {
        console.log(hashedClassId)
        const url = `/ficcheck/api/classroom/GET/defaultSeatMap/${hashedClassId}`
        console.log(url)
        const response = await fetch(url);
    
        // Check the response status to handle different scenarios
        if (response.status === 200) {
          const responseBody = await response.text();
          if (responseBody === "none") {
            // Seat map data is not available, use default seat map
            postDefaultSeatmap(DEFAULT_SEATMAP, hashedClassId);
            saveCurrentSeatMap(DEFAULT_SEATMAP, hashedClassId);
          } else {
            // Default seat map data is available
            const data = JSON.parse(responseBody);
            saveCurrentSeatMap(data, hashedClassId); //Save to the current seat map database
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
async function saveCurrentSeatMap(updatedSeatMap, hashedCid) {
  try {

  const response = await fetch(`/ficcheck/api/classroom/POST/currentSeatMap/${hashedCid}`, {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedSeatMap),
  });

  if (response.ok) {
      console.log("POST success");
      
  } else {
      console.error('Error:', response.status);
  }
  } catch (error) {
  console.error('Error:', error);
  }
}

async function postDefaultSeatmap(updatedSeatMap, hashedCid) {
  try {

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