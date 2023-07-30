// get data for the chars and display:

let hashedCid = document.querySelector('#hashedCid').value.trim();
let percentage = document.querySelector('#percentage').value.trim();
let userEntries = document.querySelector('#userEntries').value.trim();
let totalAttendance = document.querySelector('#totalAttendance').value.trim();
let checkedInTimes = document.querySelector('#checkedInTimes').value.trim();

console.log(percentage);



// Drop down profile menu
function toggleDropdown() {
  var dropdownContent = document.getElementById("dropdownContent");
  dropdownContent.style.display = (dropdownContent.style.display === "block") ? "none" : "block";
}

document.addEventListener('DOMContentLoaded', function() {
  var attendanceRate = percentage; // Change this value to the actual attendance rate

  var svg = document.querySelector('.attendance-chart');
  drawAttendanceChart(svg, attendanceRate);

  function drawAttendanceChart(svg, percentage) {
      var radius = 40;
      var circumference = 2 * Math.PI * radius;
      var offset = circumference - (circumference * percentage / 100);

      // Create background circle
      var backgroundCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      backgroundCircle.setAttribute("cx", "50");
      backgroundCircle.setAttribute("cy", "50");
      backgroundCircle.setAttribute("r", radius);
      backgroundCircle.setAttribute("class", "background-circle");
      svg.appendChild(backgroundCircle);

      // Create red circle for the attendance rate
      var rateCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      rateCircle.setAttribute("class", "attendance-rate-circle");
      rateCircle.setAttribute("cx", "50");
      rateCircle.setAttribute("cy", "50");
      rateCircle.setAttribute("r", radius);
      rateCircle.setAttribute("stroke", "#cc0633");
      rateCircle.setAttribute("stroke-width", "5");
      rateCircle.setAttribute("stroke-dasharray", circumference);
      rateCircle.setAttribute("stroke-dashoffset", offset);
      rateCircle.setAttribute("fill", "transparent");
      svg.appendChild(rateCircle);

      // Create text for the percentage
      var percentageText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      percentageText.setAttribute("class", "percentage-text");
      percentageText.setAttribute("x", "50");
      percentageText.setAttribute("y", "50");
      percentageText.setAttribute("text-anchor", "middle"); // Center the text horizontally
      percentageText.setAttribute("dominant-baseline", "middle"); // Center the text vertically
      percentageText.setAttribute("fill", "#cc0633");
      percentageText.textContent = percentage + "%";
      svg.appendChild(percentageText);
  }
});
