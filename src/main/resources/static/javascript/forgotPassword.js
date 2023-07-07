/*
check whether the format of email is either : 
1) example@learning.fraseric.ca
2) example@sfu.ca
*/




function validateEmail() {
    var emailInput = document.getElementById("email");
    var email = emailInput.value;
    var emailPattern = /^[\w-.]+@(learning\.fraseric\.ca|sfu\.ca)$/;
    var isValid = emailPattern.test(email);

    if (!email.trim()) {
      emailInput.setCustomValidity("Please enter an email address");
      return false;
    }

    if (!isValid) {
      emailInput.setCustomValidity("Invalid email format");
      return false;
    } else {
      emailInput.setCustomValidity("");
      return true;
    }
}



function validateForm(event) {
  var isValidEmail = validateEmail();
    
  if (!isValidEmail) {
    event.preventDefault(); // Prevent form submission
    return false;
  }

  // Proceed with other form validations, if any
  return true;
}


var form = document.querySelector('form');
form.addEventListener('submit', validateForm);

var emailInput = document.getElementById("email");
emailInput.addEventListener('input', clearEmailValidity);




function clearEmailValidity() {
  var emailInput = document.getElementById("email");
  emailInput.setCustomValidity("");
}



