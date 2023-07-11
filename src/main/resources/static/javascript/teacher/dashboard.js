function setContainerHeight() {
    var container = document.getElementById('container');
    var screenHeight = window.innerHeight;
    var containerHeight = screenHeight - 38;
    container.style.height = containerHeight + 'px';
}

window.addEventListener('resize', setContainerHeight);
setContainerHeight();