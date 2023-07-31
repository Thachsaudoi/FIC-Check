import { DEFAULT_SEATMAP } from '../SEATMAP.js';

let hashedTeacherId = document.querySelector('#hashedTeacherId').value.trim();

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

/* 
  When teacher press start a class it will check if that class has a default seat map
  if yes -> save it to current seat map
  if not then post up default map
*/
document.querySelectorAll(".startClass").forEach(function(element) {
    element.addEventListener("click", function(event) {
      event.preventDefault(); // Prevent the default link behavior
  
      // Retrieve the hashedCid from the data attribute of the clicked element
      const hashedCid = element.getAttribute("data-hashed-cid");
  
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
  