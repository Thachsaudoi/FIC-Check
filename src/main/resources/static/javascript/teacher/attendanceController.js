document.getElementById('startAttendance').addEventListener("submit", (event)=>{
    event.preventDefault();
    let hashedCid = $("#hashedCid").val();
    if (confirm("Are you sure you want to start taking attendance for this course")) {
        $.ajax({
            type: 'POST',
            url: '/teacher/course/startAttendance',
            data: {
                hashedCid: hashedCid
            },
            success: function(response) {
                // Handle the successful response here
                window.location.href=`/user/course/${hashedCid}/attendanceTaking`;
            },
            error: function(xhr, status, error) {
                // Handle any errors that occur during the request
                console.error("An error occurred while updating the course:", error);
            }
        });
    }
} )