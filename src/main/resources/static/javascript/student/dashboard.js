var socket = new SockJS('/ws');
var stompClient = Stomp.over(socket);

let studentHashedId = document.querySelector('#studentHashedId').value;

document.addEventListener("DOMContentLoaded", function() {
    //Update live class in the livesession whenever student reload
    updateLiveStatus();
})
// Connect to the WebSocket server
stompClient.connect({}, onConnected, onError);

// Handle successful connection
function onConnected() {
    // Subscribe to the topic where messages are received
    var classrooms = document.getElementsByClassName("rooms");
    for (var i = 0; i < classrooms.length; i++) {
        var form = classrooms[i];
        let hashedCid = form.querySelector("#hashedCid").value.trim();
        let userName = form.querySelector("#userName").value.trim();
        if (userName && hashedCid) {
            stompClient.subscribe('/topic/' + hashedCid + '/public', onMessageReceived);
        }
    }
}
// let liveSession = document.getElementById('classrooms');
function updateLiveStatus(hashedCid, type) {
    /*
        FRONT END TAKES CARE OF THIS
        This function is to loop though the live classes and appear in the live
        Create element to display the live classes 
    */
    const classDetailsList = document.querySelectorAll(".rooms");
    classDetailsList.forEach(classDetails => {
        let attendanceStatus = classDetails.querySelector("#attendanceStatus").value.trim();
        const inputHashedCid = classDetails.querySelector("#hashedCid").value.trim();
        const live = classDetails.querySelector('#live-session');
        if (hashedCid) {
          if (hashedCid === inputHashedCid && type === "start") {
            live.style.display = "block";
          } else if (hashedCid === inputHashedCid && type === "stop") {
            live.style.display = "none";
          }
        } 
        //if find the LIVE CLASSROOM ID == List of enrolled class
        if (attendanceStatus === "live") {
          live.style.display = "block";
        }

    })
}
// Handle error in WebSocket connection
function onError(error) {

    console.error("Error connecting to WebSocket server:", error);
}

// Handle received messages
function onMessageReceived(payload) {
    // Parse the message payload
    var message = JSON.parse(payload.body);

    if (message.type === "StartAttendance") {

        updateLiveStatus(message.hashedCid, "start");
    } else if (message.type === 'StopAttendance') {
        //WHEN THE TEACHER STOP TAKING ATTENDANCE
        updateLiveStatus(message.hashedCid, "stop");
    }
}

// Set container height
function setContainerHeight() {
  var container = document.getElementById('container');
  var screenHeight = window.innerHeight;
  var containerHeight = screenHeight - 40;
  container.style.height = containerHeight + 'px';
}

window.addEventListener('resize', setContainerHeight);
setContainerHeight();

// Handle changing each section in menu
function toggleSection(section) {
  var main = document.getElementById('main');
  var archive = document.getElementById('archive');
  var listOne = document.getElementsByClassName('listOne')[0];
  var listTwo = document.getElementsByClassName('listTwo')[0];
  var listOneText = listOne.querySelector('.ul-text');
  var listTwoText = listTwo.querySelector('.ul-text');
  var imgOne = document.getElementById('menu');
  var imgTwo = document.getElementById('add');

  var navOne = document.getElementsByClassName('navOne')[0];
  var navTwo = document.getElementsByClassName('navTwo')[0];

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
    navOne.style.color = 'black';
    navTwo.style.color = 'white';
    navOne.style.fontWeight = '600';
    navTwo.style.fontWeight = 'normal';
    
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
    navOne.style.color = 'white';
    navTwo.style.color = 'black';
    navOne.style.fontWeight = 'normal';
    navTwo.style.fontWeight = '600';
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

var navOne = document.getElementsByClassName('navOne')[0];
var navTwo = document.getElementsByClassName('navTwo')[0];

navOne.addEventListener('click', function() {
  toggleSection('main');
  navOne.style.backgroundColor = 'white';
  navTwo.style.backgroundColor = 'transparent';
});

navTwo.addEventListener('click', function() {
  toggleSection('archive');
  navOne.style.backgroundColor = 'transparent';
  navTwo.style.backgroundColor = 'white';
});

// Random pastel color for each class
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

// Flipping classes when width > 1200px
function toggleRoomContent(event) {
var roomContent = event.currentTarget.querySelector('.roomContent');
var options = event.currentTarget.querySelector('.options');
roomContent.classList.toggle('hidden');
options.classList.toggle('visible');
}

var rooms = document.querySelectorAll('.rooms');

function enableToggleRoomContent() {
rooms.forEach(function(room) {
  room.addEventListener('click', toggleRoomContent);
});
}

function disableToggleRoomContent() {
rooms.forEach(function(room) {
  room.removeEventListener('click', toggleRoomContent);
});
}

if (window.innerWidth <= 1200) {
disableToggleRoomContent();
} else {
enableToggleRoomContent();
}

window.addEventListener('resize', function() {
if (window.innerWidth <= 1200) {
  disableToggleRoomContent();
} else {
  enableToggleRoomContent();
}
});

// Drop down profile menu
function toggleDropdown() {
var dropdownContent = document.getElementById("dropdownContent");
dropdownContent.style.display = (dropdownContent.style.display === "block") ? "none" : "block";
}

// Drop down profile menu archive
function toggleDropdown2() {
  var dropdownContent = document.getElementById("dropdownContent2");
  dropdownContent.style.display = (dropdownContent.style.display === "block") ? "none" : "block";
  }

function navtoggleDropdown() {
var dropdownContent = document.getElementById("navdropdownContent");
dropdownContent.style.display = (dropdownContent.style.display === "block") ? "none" : "block";
}

// Open and close add class form
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

// Pop up options for each class when width <= 1200px
function toggleResponsiveOptions(event) {
  var room = event.currentTarget;
  var responsiveOptions = room.querySelector('.responsive-options');
  var backdrop = document.getElementById('backdrop');

  responsiveOptions.classList.toggle('visible');

  backdrop.classList.toggle('visible');

  if (responsiveOptions.classList.contains('visible')) {
    backdrop.addEventListener('click', function closeResponsiveOptionsOnClick() {
      closeResponsiveOptions(room);
      backdrop.removeEventListener('click', closeResponsiveOptionsOnClick);
    });
  }
}

function closeResponsiveOptions(room) {
  var responsiveOptions = room.querySelector('.responsive-options');
  var backdrop = document.getElementById('backdrop');

  responsiveOptions.classList.remove('visible');
  backdrop.classList.remove('visible');
}

function enableToggleResponsiveOptions() {
  rooms.forEach(function(room) {
    room.addEventListener('click', toggleResponsiveOptions);
  });
}

function disableToggleResponsiveOptions() {
  rooms.forEach(function(room) {
    room.removeEventListener('click', toggleResponsiveOptions);
  });
}

var rooms = document.querySelectorAll('.rooms');

if (window.innerWidth <= 1200) {
  enableToggleResponsiveOptions();
} else {
  disableToggleResponsiveOptions();
  closeAllResponsiveOptions(); // Close all popups if open when switching to >1200px
}

window.addEventListener('resize', function() {
if (window.innerWidth <= 1200) {
  enableToggleResponsiveOptions();
} else {
  disableToggleResponsiveOptions();
  closeAllResponsiveOptions(); // Close all popups if open when switching to >1200px
}
});

document.getElementById('backdrop').addEventListener('click', closeAllResponsiveOptions);

function closeAllResponsiveOptions() {
  rooms.forEach(function(room) {
    closeResponsiveOptions(room);
  });
}

// Hide options visibility when resize
function adjustOptionsAndRoomContentVisibility() {
  var rooms = document.querySelectorAll('.rooms');
  rooms.forEach(function(room) {
    var options = room.querySelector('.options');
    var roomContent = room.querySelector('.roomContent');

    if (window.innerWidth <= 1200) {
      options.classList.remove('visible'); 
      roomContent.classList.remove('hidden');
    } 
  });
}

adjustOptionsAndRoomContentVisibility();

window.addEventListener('resize', function() {
  adjustOptionsAndRoomContentVisibility();
});

// // Change nav logo when width <= 550px
// function updateLogoSrc() {
//   const logoImg = document.getElementById('navbar-logo-img');
//   const newSrc = '/images/fic_small_alter.png';
//   if (window.innerWidth <= 550) {
//     logoImg.src = newSrc;
//   } else {
//     logoImg.src = '/images/fic_logo_alter.svg';
//   }
// }

// Change nav logo when width <= 475px
function updateLogoSrc() {
  const logoImg = document.getElementById('navbar-logo-img');
  const newSrc = '/images/fic_small_alter.png';
  if (window.innerWidth <= 525) {
      logoImg.src = newSrc;
  } else {
      // Change back to original src if width > 475px
      logoImg.src = '/images/fic_logo_alter.svg';
  }
}


const joinClassForm = document.querySelector("#joinClassForm");
joinClassForm.addEventListener("submit", async (event)=> {
  event.preventDefault();
  const roomCode = document.getElementById('roomCode').value.trim();
  
  if (roomCode) {
    const response = await fetch(`/student/join`, {
      method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      body: JSON.stringify({ roomCode: roomCode }),
    });
    if (response.ok) {
      const data = await response.json();
      if (data.status === 'success') {
        Swal.fire({
          title: 'Success',
          text: 'You successfully joined the class!',
          icon: 'success'
        }).then((result) => {
            // The result parameter indicates whether the user clicked "OK" (result.value is true) or dismissed the alert (result.dismiss is true).
            if (result.value) {
              // Reload the page if the user clicked "OK"
              window.location.reload();
            } else if (result.dismiss === Swal.DismissReason.esc || result.dismiss === Swal.DismissReason.overlay || result.dismiss === Swal.DismissReason.backdrop) {
              // Reload the page if the user dismissed the alert by clicking outside the modal or pressing the escape key
              window.location.reload();
            }
      });
      } 
      if (data.status === 'invalidRoom') {
        Swal.fire({
          title: 'Invalid Room',
          text: 'Please ensure the room code entered is correct!',
          icon: 'error'
        });
      } 
      if (data.status === 'userInClass') {
        Swal.fire({
          title: 'Join Fail',
          text: 'You already joined this class!',
          icon: 'error'
        });
        closeForm();
      }
    }
  }
})

window.addEventListener('load', updateLogoSrc);

window.addEventListener('resize', updateLogoSrc);

// copy to clipboard
function copyJoinCode(event) {
  event.stopPropagation();
  const button = event.currentTarget;
  const joinCode = button.previousElementSibling.textContent;
  const copiedText = button.querySelector(".copied-text");
  const triangle = button.querySelector(".triangle");

  copiedText.style.display = "block";
  triangle.style.display = "block";

  setTimeout(function () {
      copiedText.style.display = "none";
      triangle.style.display = "none";
  }, 2500);

  navigator.clipboard.writeText(joinCode)
      .then(() => {
          console.log('Join code copied to clipboard: ' + joinCode);
      })
      .catch((error) => {
          console.error('Failed to copy join code: ', error);
      });
}

