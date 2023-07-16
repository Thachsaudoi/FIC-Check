document.getElementById("editForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Retrieve the form values
    let hashedCid = $("#hashedCid").val();
    let classroomName = $("#classroomName").val();
    let roomNumber = $("#roomNumber").val();

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
});


function deleteCourse(hashedCid, classroomName, roomNumber) {
    // Generate the confirmation message
    let confirmationMessage = `To confirm, type "${classroomName}-${roomNumber}" in the box below:`;

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
