



function validatePassword() {
    var passwordInput = document.getElementById("password");
    var password = passwordInput.value;
    var hasNumber = /\d/.test(password); // Check if password contains a number
    var hasSymbol = /[<>,.?;:'"{}()_\-=+@$!%*#?& ]/.test(password); // Check if password contains a symbol
    var passwordPattern = /^(?=.*[<>,.?;:'"{}()_\-=+@$!%*#?& ])[A-Za-z\d<>,.?;:'"{}()_\-=+@$!%*#?& ]{8,}$/;
    var isValid = passwordPattern.test(password);

    if (!isValid) {
        if (!hasNumber && hasSymbol) {
          passwordInput.setCustomValidity("Password must contain at least one number");
        } else if (hasNumber && !hasSymbol) {
          passwordInput.setCustomValidity("Password must contain at least one symbol");
        } else if (!hasNumber && !hasSymbol){
          passwordInput.setCustomValidity("Password must be at least 8 characters long, contain at least one symbol, and at least one number");
        } else if (password.length < 8) {
          passwordInput.setCustomValidity("Password must be at least 8 characters long");
        } else {
          passwordInput.setCustomValidity("Invalid password");
        }
        return false;
    } else {
        passwordInput.setCustomValidity("");
        return true;
    }
}


function validateForm(event) {
  
  var isValidPassword = validatePassword();

  if ( !isValidPassword) {
    event.preventDefault(); // Prevent form submission
    return false;
  }

  // Proceed with other form validations, if any
  return true;
}


var form = document.querySelector('form');
form.addEventListener('submit', validateForm);


var passwordInput = document.getElementById("password");
passwordInput.addEventListener('input', clearPasswordValidity);



function clearPasswordValidity() {
  var passwordInput = document.getElementById("password");
  passwordInput.setCustomValidity("");
}



function checkPasswordMatch(fieldConfirmPassword) {
    if (fieldConfirmPassword.value != $("#password").val()) {
        fieldConfirmPassword.setCustomValidity("Passwords do not match!");
    } else {
        fieldConfirmPassword.setCustomValidity("");
    }
}
