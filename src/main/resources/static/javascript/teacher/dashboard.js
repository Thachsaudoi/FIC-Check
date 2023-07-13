function setContainerHeight() {
    var container = document.getElementById('container');
    var screenHeight = window.innerHeight;
    var containerHeight = screenHeight - 40;
    container.style.height = containerHeight + 'px';
}

window.addEventListener('resize', setContainerHeight);
setContainerHeight();

function toggleSection(section) {
    var main = document.getElementById('main');
    var archive = document.getElementById('archive');
    var listOne = document.getElementsByClassName('listOne')[0];
    var listTwo = document.getElementsByClassName('listTwo')[0];
    var listOneText = listOne.querySelector('.ul-text');
    var listTwoText = listTwo.querySelector('.ul-text');
    var imgOne = document.getElementById('menu');
    var imgTwo = document.getElementById('add');
  
    if (section === 'main') {
      main.style.display = 'block';
      archive.style.display = 'none';
  
      listOne.style.backgroundColor = 'white';
      listTwo.style.backgroundColor = 'transparent';
      listTwo.classList.remove('listTwo--before-display', 'listTwo--after-display');
      listOne.classList.remove('listOne--before-hide', 'listOne--after-hide');
      listOneText.style.color = 'black';
      listTwoText.style.color = 'white';
      listOneText.style.fontWeight = '600';
      listTwoText.style.fontWeight = 'normal';
      imgOne.src = "/images/menu_alter.png";
      imgTwo.src = "/images/archive.png";
      
    } else if (section === 'archive') {
      main.style.display = 'none';
      archive.style.display = 'block';
  
      listOne.style.backgroundColor = 'transparent';
      listTwo.style.backgroundColor = 'white';
      listTwo.classList.add('listTwo--before-display', 'listTwo--after-display');
      listOne.classList.add('listOne--before-hide', 'listOne--after-hide');
      listOneText.style.color = 'white';
      listTwoText.style.color = 'black';
      listOneText.style.fontWeight = 'normal';
      listTwoText.style.fontWeight = '600';
      imgOne.src = "/images/menu.png";
      imgTwo.src = "/images/archive_alter.png";
    }
}
  
  
var listOne = document.getElementsByClassName('listOne')[0];
var listTwo = document.getElementsByClassName('listTwo')[0];
  
listOne.addEventListener('click', function() {
    toggleSection('main');
    listOne.style.backgroundColor = 'white';
    listTwo.style.backgroundColor = 'transparent';
});
  
listTwo.addEventListener('click', function() {
    toggleSection('archive');
    listOne.style.backgroundColor = 'transparent';
    listTwo.style.backgroundColor = 'white';
});

function randomPastelColor() {
  var hue = Math.floor(Math.random() * 360);
  var saturation = 25 + Math.floor(Math.random() * 50);
  var lightness = 75 + Math.floor(Math.random() * 10);
  return 'hsl(' + hue + ', ' + saturation + '%, ' + lightness + '%)';
}

document.addEventListener('DOMContentLoaded', function() {
  var rooms = document.getElementsByClassName('rooms');
  for (var i = 0; i < rooms.length; i++) {
      rooms[i].style.backgroundColor = randomPastelColor();
  }
});

function toggleRoomContent(event) {
  var roomContent = event.currentTarget.querySelector('.roomContent');
  var options = event.currentTarget.querySelector('.options');
  roomContent.classList.toggle('hidden');
  options.classList.toggle('visible');
}



var rooms = document.querySelectorAll('.rooms');
rooms.forEach(function(room) {
  room.addEventListener('click', toggleRoomContent);
});

function toggleDropdown() {
  var dropdownContent = document.getElementById("dropdownContent");
  dropdownContent.style.display = (dropdownContent.style.display === "block") ? "none" : "block";
}

function openForm() {
  var formContainer = document.getElementById("formContainer");
  formContainer.classList.add("visible");
  document.body.style.overflow = "hidden"; // Prevent scrolling when form is open
}

function closeForm() {
  var formContainer = document.getElementById("formContainer");
  formContainer.classList.remove("visible");
  document.body.style.overflow = "auto"; // Enable scrolling when form is closed
}

function openEdit() {
  var formContainer = document.getElementById("editContainer");
  formContainer.classList.add("visible");
  document.body.style.overflow = "hidden"; // Prevent scrolling when form is open
}

function closeEdit() {
  var formContainer = document.getElementById("editContainer");
  formContainer.classList.remove("visible");
  document.body.style.overflow = "auto"; // Enable scrolling when form is closed
}

document.querySelectorAll("[id^='editForm-']").forEach(function(form) {
  form.addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Retrieve the form values
    let hashedCid = form.querySelector("#hashedCid").value;
    let classroomName = form.querySelector("#classroomName").value;
    let roomNumber = form.querySelector("#roomNumber").value;

    console.log(classroomName);
    console.log(roomNumber);
    console.log(hashedCid);

    if (confirm("Are you sure you want to make these changes?")) {
        $.ajax({
            type: 'POST',
            url: '/teacher/edit/course',
            data: {
                hashedCid: hashedCid,
                classroomName: classroomName,
                roomNumber: roomNumber,
            },
            success: function(response) {
                // Handle the successful response here
                window.location.href="/teacher/dashboard";
            },
            error: function(xhr, status, error) {
                // Handle any errors that occur during the request
                console.error("An error occurred while updating the course:", error);
            }
        });
    }
  }
)});


function deleteCourse(hashedCid, classroomName, roomNumber) {
  // Generate the confirmation message
  let confirmationMessage = `To confirm, type "${classroomName}-${roomNumber}" in the box below:`;
  console.log(classroomName);
  console.log(roomNumber);
  console.log(hashedCid);
  // Show the prompt box to the user
  let userInput = prompt(confirmationMessage);

  if (userInput !== null && userInput.trim() === `${classroomName}-${roomNumber}`) {
      // User confirmed the deletion, send request to the backend
      $.ajax({
          type: 'POST',
          url: '/teacher/edit/deleteCourse',
          data: {
              hashedCid: hashedCid
          },
          success: function() {
              window.location.href="/teacher/dashboard";
          },
          error: function(xhr, status, error) {
              console.error("An error occurred while deleting the course:", error);
          }
      });
  } else {
      // User canceled the deletion or entered incorrect input
      alert("Deletion canceled or invalid input.");
  }
}