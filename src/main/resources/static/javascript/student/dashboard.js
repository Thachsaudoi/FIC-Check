var socket = new SockJS('/ws');
var stompClient = Stomp.over(socket);
let liveSession = document.getElementById('live-session');
let studentHashedId = document.querySelector('#studentHashedId').value;

document.addEventListener("DOMContentLoaded", function() {
    //Update live class in the livesession whenever student reload
    updateIsLive();
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

function updateIsLive() {
    /*
        FRONT END TAKES CARE OF THIS
        This function is to loop though the live classes and appear in the live
        Create element to display the live classes 
    */
    const classDetailsList = document.querySelectorAll(".rooms");
    classDetailsList.forEach(classDetails => {
        const isLive = classDetails.querySelector("#isLive").value.trim();
        const hashedCid = classDetails.querySelector("#hashedCid").value.trim();
        //if find the LIVE CLASSROOM ID == List of enrolled class
        if (isLive === "true") {
            //take the classnam and room number
            const className = classDetails.querySelector("#className").textContent.trim();
            const roomNumber = classDetails.querySelector("#roomNumber").textContent.trim();
        
            // Create elements to display class name and room number
            // const classDetailElement = document.createElement('li');
            // classDetailElement.id=`class-${hashedCid}`
            // const classDetailName = document.createElement('strong');
            // const classDetailRoom = document.createElement('strong');
            // classDetailName.textContent = `Class Name: ${className}`;
            // classDetailRoom.textContent = `Room number: ${roomNumber}`;
            // var a = document.createElement('a');
            // let hrefValue = `/student/${studentHashedId}/courseStart/${hashedCid}`
            // a.setAttribute("href", hrefValue);
            // a.textContent = "Join today's class"; // this line will be able to change what is shown on the student dashboard when it is live
            // classDetailElement.appendChild(a); // add link to the class
            // classDetailElement.appendChild(classDetailName)
            // classDetailElement.appendChild(classDetailRoom)
            // liveSession.appendChild(classDetailElement)
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
    if (message.type === 'StartAttendance') {
        updateIsLive();
    } else if (message.type === 'StopAttendance') {
        //WHEN THE TEACHER STOP TAKING ATTENDANCE
        const liveClass = document.getElementById(`class-${message.hashedCid}`); 
        // get the id of the class that is no longer life.
        if (liveClass) {
            liveSession.removeChild(liveClass);
        } else {
            console.log("No live class element to remove.");
        }
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

window.addEventListener('load', updateLogoSrc);
window.addEventListener('resize', updateLogoSrc);

