let userName = document.querySelector('#teacherName').value.trim();
let hashedCid = document.querySelector('#hashedCid').value.trim();
let editAttendanceStatusButton = document.querySelector('#editAttendanceStatusButton');
let hashedTeacherId = document.querySelector('#hashedTeacherId').value.trim();
let recordId = document.querySelector('#recordId').value.trim();
let seatMapData = document.querySelector("#seatMap").value.trim();

function toggleDropdown2() {
  var dropdownContent = document.getElementById("dropdownContent");
  dropdownContent.style.display = (dropdownContent.style.display === "block") ? "none" : "block";
}

async function updateAttendanceStatus(entryId, status) {
    // Prepare the data to be sent via AJAX
    console.log(entryId)
    console.log(status)
    console.log(hashedCid)
    console.log(hashedTeacherId)
    var postData = {
        entryId: entryId,
        status: status,
        recordId : recordId
    };
    $.ajax({
        type: 'POST',
        url: '/teacher/' + hashedTeacherId + '/' + hashedCid + '/entry/' + entryId,
        data: postData,
        error: function(xhr, status, error) {
            console.error("BROOOOOOOOOOO", error);
        }
    });
        
       
    }

    function toggleDropdown(entryId) {
    var spanElement = document.getElementById('attendanceStatusSpan_' + entryId);
    var currentStatus = spanElement.textContent.trim();
    
    // If there is already a dropdown, return (to avoid creating a new one)
    if (spanElement.nextElementSibling && spanElement.nextElementSibling.id === 'attendanceStatusDropdown') {
        return;
    }

    // Create the dropdown element
    var dropdown = document.createElement('select');
    dropdown.id = 'attendanceStatusDropdown';
    var options = ["Checked-In", "Absent", "Excused"];
    for (var i = 0; i < options.length; i++) {
        var option = document.createElement('option');
        option.text = options[i];
        dropdown.add(option);
    }
    
    // Set the selected option to the current status
    var selectedIndex = options.indexOf(currentStatus);
    if (selectedIndex !== -1) {
        dropdown.selectedIndex = selectedIndex;
    } else {
        dropdown.selectedIndex = 0; // Default to the first option if status is not recognized
    }

    // Hide the span and show the dropdown
    spanElement.style.display = 'none';
    spanElement.parentNode.insertBefore(dropdown, spanElement.nextSibling);

    // Change the button text from "Edit" to "Save"
    var editButton = document.getElementById('editAttendanceStatusButton_' + entryId);
    editButton.style.display = 'none'; // Hide the "Edit" button
    var saveButton = document.getElementById('saveAttendanceStatusButton_' + entryId);
    saveButton.style.display = 'inline-block'; // Show the "Save" button

    // Add an event listener for the "Save" button
    saveButton.addEventListener('click', function () {
        // Get the selected option from the dropdown
        var selectedOption = dropdown.options[dropdown.selectedIndex].text;

        // Perform the AJAX POST request
        updateAttendanceStatus(entryId, selectedOption)
            .then(function (responseData) {
                // Update the span text with the selected option
                spanElement.textContent = selectedOption;
                // Show the span element again and hide the dropdown
                spanElement.style.display = 'inline-block';
                dropdown.style.display = 'none';
                // Show the "Edit" button again
                editButton.style.display = 'inline-block';
                // Hide the "Save" button
                saveButton.style.display = 'none';
            })
            .catch(function (error) {
                console.error('Error:', error);
            });
    });

    // Add an event listener for the "Edit" button
    editButton.addEventListener('click', function () {
        // Hide the span and show the dropdown
        spanElement.style.display = 'none';
        dropdown.style.display = 'inline-block';
        // Hide the "Edit" button
        editButton.style.display = 'none';
        // Show the "Save" button
        saveButton.style.display = 'inline-block';
    });
}



const totalSeats = 48;
const seatMap = {
  seats: []
};


async function fetchCurrentSeatMap(hashedCid) {
   
    // Default seat map data is available
    const data = JSON.parse(seatMapData);
    console.log(data)
    // TODO: Find out why the map doesn't load, the thing currently get into this function.
    await generateSeatMap();
    await loadSeatMap(data);
      
}



function loadSeatMap(data) {
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
        const seatIndex = parseInt(event.target.getAttribute('data-seat-index'));
        const { studentName } = seatMap.seats[seatIndex];

        if (studentName !== '') {
          // Seat is already occupied, ask if the teacher wants to remove the student
          Swal.fire({
            title: 'Remove Student from Seat?',
            text: `Do you want to remove ${studentName} from this seat?`,
            showDenyButton: true,
            confirmButtonText: 'Yes, Remove',
            denyButtonText: 'No, Cancel',
            icon: 'question'
          }).then((result) => {
            if (result.isConfirmed) {
              // Teacher confirmed removal, update seat data
              seatMap.seats[seatIndex].studentName = '';
              seatMap.seats[seatIndex].studentEmail = '';
              seatElement.innerText = seatMap.seats[seatIndex].seatNumber;
              seatElement.classList.remove('occupied');

              // Save the updated seat map
              saveCurrentSeatMap(seatMap);
            }
          });
        } else {
          // Seat is empty, you can handle the case where the teacher can perform other actions when a vacant seat is clicked
        }
      });

      lineElement.appendChild(seatElement);
    }

    seatMapContainer.appendChild(lineElement);
  }
}

fetchCurrentSeatMap(hashedCid);

// Search bar
$(document).ready(function () {
  $("#searchBar").on("keyup", function () {
      var value = $(this).val().toLowerCase();
      $("#studentTable tbody tr").filter(function () {
          var name = $(this).find("td:nth-child(1)").text().toLowerCase();
          var email = $(this).find("td:nth-child(2)").text().toLowerCase();
          $(this).toggle(name.indexOf(value) > -1 || email.indexOf(value) > -1);
      });
  });
});