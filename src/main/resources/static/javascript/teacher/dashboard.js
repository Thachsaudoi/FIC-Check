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
    var createClass = document.getElementById('createClass');
    var listOne = document.getElementsByClassName('listOne')[0];
    var listTwo = document.getElementsByClassName('listTwo')[0];
    var listOneText = listOne.querySelector('.ul-text');
    var listTwoText = listTwo.querySelector('.ul-text');
    var imgOne = document.getElementById('menu');
    var imgTwo = document.getElementById('add');
  
    if (section === 'main') {
      main.style.display = 'block';
      createClass.style.display = 'none';
  
      listOne.style.backgroundColor = 'white';
      listTwo.style.backgroundColor = 'transparent';
      listTwo.classList.remove('listTwo--before-display', 'listTwo--after-display');
      listOne.classList.remove('listOne--before-hide', 'listOne--after-hide');
      listOneText.style.color = 'black';
      listTwoText.style.color = 'white';
      listOneText.style.fontWeight = '600';
      listTwoText.style.fontWeight = 'normal';
      imgOne.src = 'menu_alter.png';
      imgTwo.src = 'add.png';
      
    } else if (section === 'createClass') {
      main.style.display = 'none';
      createClass.style.display = 'block';
  
      listOne.style.backgroundColor = 'transparent';
      listTwo.style.backgroundColor = 'white';
      listTwo.classList.add('listTwo--before-display', 'listTwo--after-display');
      listOne.classList.add('listOne--before-hide', 'listOne--after-hide');
      listOneText.style.color = 'white';
      listTwoText.style.color = 'black';
      listOneText.style.fontWeight = 'normal';
      listTwoText.style.fontWeight = '600';
      imgOne.src = 'menu.png';
      imgTwo.src = 'add_alter.png';
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
    toggleSection('createClass');
    listOne.style.backgroundColor = 'transparent';
    listTwo.style.backgroundColor = 'white';
});