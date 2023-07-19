let hashedTeacherId = document.querySelector('#hashedTeacherId').value.trim();


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


function openEdit(event) {
  var editForms = document.querySelectorAll(".rooms .editContainer");
  var clickedElement = event.target;
  
  // Traverse up the DOM tree to find the parent element with the "rooms" class
  while (!clickedElement.classList.contains("rooms")) {
      clickedElement = clickedElement.parentElement;
  }

  var index = Array.from(clickedElement.parentElement.children).indexOf(clickedElement);
  var selectedFormContainer = editForms[index];
  
  if (selectedFormContainer) {
      selectedFormContainer.classList.add("visible");
      document.body.style.overflow = "hidden"; // Prevent scrolling when form is open
  }
}

function closeEdit(event) {
  var editForms = document.querySelectorAll(".rooms .editContainer");
  var clickedElement = event.target;

  // Traverse up the DOM tree to find the parent element with the "rooms" class
  while (!clickedElement.classList.contains("rooms")) {
      clickedElement = clickedElement.parentElement;
  }

  var index = Array.from(clickedElement.parentElement.children).indexOf(clickedElement);
  var selectedFormContainer = editForms[index];

  if (selectedFormContainer) {
      selectedFormContainer.classList.remove("visible");
      document.body.style.overflow = "auto"; // Enable scrolling when form is closed
  }
}

// Edit form retrieving info
document.querySelectorAll("[id^='editForm-']").forEach(function(form) {

  let saveButton = form.querySelector("#saveButton");

    form.addEventListener("submit", function(event) {
      let saveButton = form.querySelector("#saveButton");
     
      event.preventDefault(); // Prevent the default form submission

      // Retrieve the form values
      let hashedCid = form.querySelector("#hashedCid").value;
      let classroomName = form.querySelector("#classroomName").value;
      let roomNumber = form.querySelector("#roomNumber").value;

      console.log(classroomName);
      console.log(roomNumber);
      console.log(hashedCid);

      if( event.submitter === saveButton) {
        
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn btn-success',
            cancelButton: 'btn btn-danger'
          },
          buttonsStyling: true
        })
        
        swalWithBootstrapButtons.fire({
          title: 'Save changes?',
          text: "Do you want to proceed and save the changes you made?",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes!',
          cancelButtonText: 'No, cancel!',
          reverseButtons: true
        }).then((result) => {
          if (result.isConfirmed) {
            swalWithBootstrapButtons.fire(
              'Changes Applied',
              'Your class information has been updated!',
              'success'
            ).then((result) => {
              if (result.isConfirmed) {
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
                    // Redirect to the specified URL after the changes are saved
                    window.location.href = "/teacher/dashboard";
                  },
                  error: function(xhr, status, error) {
                    // Handle any errors that occur during the request
                    console.error("An error occurred while updating the course:", error);
                  }
                });
              }
            });
          }
          else if (
            /* Read more about handling dismissals below */
            result.dismiss === Swal.DismissReason.cancel
          ) {
            swalWithBootstrapButtons.fire(
              'Cancelled',
              'Changes is not saved',
              'error'
            )
          }
        })
       
      }
    }
    
  
)});


// Delete class function
function deleteCourse(hashedCid, classroomName, roomNumber) {
  // Generate the confirmation message
  let confirmationMessage = `To confirm, type "${classroomName}-${roomNumber}" in the box below:`;

  // Show the SweetAlert2 input modal to the user
  Swal.fire({
    title: 'Confirm Deletion',
    text: confirmationMessage,
    input: 'text',
    inputAttributes: {
      autocapitalize: 'off'
    },
    showCancelButton: true,
    confirmButtonText: 'Delete',
    showLoaderOnConfirm: true,
    preConfirm: (userInput) => {
      if (userInput !== `${classroomName}-${roomNumber}`) {
        Swal.showValidationMessage('Invalid input. Please type the correct class name and room number.');
      }
      // Return the user input so that it can be used in the Ajax request
      return userInput;
    },
    allowOutsideClick: () => !Swal.isLoading()
  }).then((result) => {
    if (result.isConfirmed) {
      // User confirmed the deletion, send request to the backend
      $.ajax({
        type: 'POST',
        url: '/teacher/edit/deleteCourse',
        data: {
          hashedCid: hashedCid
        },
        success: function () {
          Swal.fire(
            'Deleted!',
            'Your class has been deleted.',
            'success'
          ).then(() => {
            window.location.href = "/teacher/dashboard";
          });
        },
        error: function (xhr, status, error) {
          console.error("An error occurred while deleting the course:", error);
          Swal.fire(
            'Error',
            'An error occurred while deleting the course. Please try again later.',
            'error'
          );
        }
      });
    } else {
      // User canceled the deletion or entered incorrect input
      Swal.fire(
        'Deletion Canceled',
        'No changes have been made to the class.',
        'info'
      );
    }
  });
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
