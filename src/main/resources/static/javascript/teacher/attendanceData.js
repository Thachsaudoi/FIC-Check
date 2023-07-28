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
  var studentData = document.getElementById('studentData');
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
    studentData.style.display = 'none';

    listOne.style.backgroundColor = 'white';
    listTwo.style.backgroundColor = 'transparent';
    listTwo.classList.remove('listTwo--before-display', 'listTwo--after-display');
    listOne.classList.remove('listOne--before-hide', 'listOne--after-hide');
    listOneText.style.color = 'black';
    listTwoText.style.color = 'white';
    listOneText.style.fontWeight = '600';
    listTwoText.style.fontWeight = 'normal';
    imgOne.src = "/images/history_alter.png";
    imgTwo.src = "/images/student.png";
    navOne.style.color = 'black';
    navTwo.style.color = 'white';
    navOne.style.fontWeight = '600';
    navTwo.style.fontWeight = 'normal';
    
  } else if (section === 'studentData') {
    main.style.display = 'none';
    studentData.style.display = 'block';

    listOne.style.backgroundColor = 'transparent';
    listTwo.style.backgroundColor = 'white';
    listTwo.classList.add('listTwo--before-display', 'listTwo--after-display');
    listOne.classList.add('listOne--before-hide', 'listOne--after-hide');
    listOneText.style.color = 'white';
    listTwoText.style.color = 'black';
    listOneText.style.fontWeight = 'normal';
    listTwoText.style.fontWeight = '600';
    imgOne.src = "/images/history.png";
    imgTwo.src = "/images/student_alter.png";
    navOne.style.color = 'white';
    navTwo.style.color = 'black';
    navOne.style.fontWeight = 'normal';
    navTwo.style.fontWeight = '600';
    navOne.style.backgroundColor = 'transparent';
    navTwo.style.backgroundColor = 'white';
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
  toggleSection('studentData');
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
  toggleSection('studentData');
  navOne.style.backgroundColor = 'transparent';
  navTwo.style.backgroundColor = 'white';
});

// Drop down profile menu
function toggleDropdown() {
  var dropdownContent = document.getElementById("dropdownContent");
  dropdownContent.style.display = (dropdownContent.style.display === "block") ? "none" : "block";
}

function toggleDropdown2() {
  var dropdownContent = document.getElementById("dropdownContent2");
  dropdownContent.style.display = (dropdownContent.style.display === "block") ? "none" : "block";
}

function navtoggleDropdown() {
    var dropdownContent = document.getElementById("navdropdownContent");
    dropdownContent.style.display = (dropdownContent.style.display === "block") ? "none" : "block";
}

// Random pastel color for each class
function randomPastelColor() {
    var hue = Math.floor(Math.random() * 360);
    var saturation = 25 + Math.floor(Math.random() * 50);
    var lightness = 75 + Math.floor(Math.random() * 10);
    return 'hsl(' + hue + ', ' + saturation + '%, ' + lightness + '%)';
}

document.addEventListener('DOMContentLoaded', function() {
    var rooms = document.getElementsByClassName('session');
    for (var i = 0; i < rooms.length; i++) {
        rooms[i].style.backgroundColor = randomPastelColor();
    }
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
