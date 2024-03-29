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
    emailInput.setCustomValidity("Invalid email format (only example@learning.fraseric.ca a or example@sfu.ca is accepted");
    return false;
  } else {
    emailInput.setCustomValidity("");
    return true;
  }
}

  

function validatePassword() {
  var passwordInput = document.getElementById("password");
  var password = passwordInput.value;
  var hasNumber = /\d/.test(password); // Check if password contains a number
  var hasSymbol = /[<>,.?;:'"{}()_\-=+@$!%*#?&/ ]/.test(password); // Check if password contains a symbol
  var passwordPattern = /^(?=.*[<>,.?;:'"{}()_\-=+@$!%*#?&/ ])[A-Za-z\d<>,.?;:'"{}()_\-=+@$!%*#?&/ ]{8,}$/;
  
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
  var isValidEmail = validateEmail();
  var isValidPassword = validatePassword();

  if (!isValidEmail || !isValidPassword) {
    event.preventDefault(); // Prevent form submission
    return false;
  }
  submitForm(event);
}

// Function to handle form submission
async function submitForm(event) {
  event.preventDefault(event)
  // Get form data
  const formData = new FormData(document.querySelector('#loginForm'));

  // Convert form data to a plain object
  const data = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });
  try {
    // Make the POST request using async/await
    const response = await fetch('/user/login/post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const responseBody = await response.text();
    // Handle the response from the server
    if (responseBody === 'success') {
      window.location.href = '/user/login';
    } else if (responseBody === 'invalidAuth') {
      Swal.fire(
        { 
          title : 'Invalid email or password',
          text :'please make sure the email or password that you enter are correct' ,
          icon :'error'
        }
      )
      //Clear out the password field
      document.querySelector('#password').value = "";
    }
  } catch (error) {
    // Handle any errors that occurred during the fetch or server-side processing
    console.error('Error:', error);
    // Display an error message or take appropriate action based on the error
  }
}

var form = document.querySelector('form');
form.addEventListener('submit', (event) => validateForm(event));

var emailInput = document.getElementById("email");
emailInput.addEventListener('input', clearEmailValidity);

var passwordInput = document.getElementById("password");
passwordInput.addEventListener('input', clearPasswordValidity);


function clearEmailValidity() {
  var emailInput = document.getElementById("email");
  emailInput.setCustomValidity("");
}

function clearPasswordValidity() {
  var passwordInput = document.getElementById("password");
  passwordInput.setCustomValidity("");
}

  function togglePasswordVisibility() {
    var passwordInput = document.getElementById("password");
    var passwordIcon = document.querySelector(".passwordIcon");
  
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      passwordIcon.src = "/images/view.png";
    } else {
      passwordInput.type = "password";
      passwordIcon.src = "/images/hide.png";
    }


}