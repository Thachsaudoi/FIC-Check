   console.log("javascript linked") ;
 
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

  function validatePasswordMatch() {
      var passwordInput = document.getElementById("password");
      var repasswordInput = document.getElementById("repassword");
      var password = passwordInput.value;
      var repassword = repasswordInput.value;

      if (password !== repassword) {
        repasswordInput.setCustomValidity("Passwords do not match");
        return false;
      } else {
        repasswordInput.setCustomValidity("");
        return true;
      }
  }



  function validateForm(event) {
    var isValidEmail = validateEmail();
    var isValidPasswordMatch = validatePasswordMatch();
    var isValidPassword = validatePassword();
    
    var usernameInput = document.getElementById("username");
    var username = usernameInput.value.trim(); // Trim the input value

    if (!username) {
      usernameInput.setCustomValidity("Please enter your full name");
      event.preventDefault(); 
      return false;
    } else {
      usernameInput.setCustomValidity("");
    }

    
      if (!isValidEmail || !isValidPasswordMatch || !isValidPassword) {
        event.preventDefault(); // Prevent form submission
        return false;
      }
       
  
      // Proceed with other form validations, if any
      submitForm(event)
  }

// Function to handle form submission
async function submitForm(event) {
  event.preventDefault(); // Prevent default form submission behavior
  // Get form data
  const formData = new FormData(document.getElementById('signupForm'));

  // Convert form data to a plain object
  const data = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });

  try {
    // Make the POST request using async/await
    const response = await fetch('/register/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const responseBody = await response.text();
    // Handle the response from the server
    if (responseBody === 'success') {
      // The registration was successful, do something (e.g., redirect to a new page)
      await Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Congratulations! Your account has been successfully created',
        showConfirmButton: false,
        timer: 1500
      })
      window.location.href = '/user/verification/send';
    } else if (responseBody === 'isNotVerified'){
      Swal.fire({
        title: 'Unverified email',
        text: 'Email exists but is not verified. Please verify your email by checking the inbox.',
        footer: "<a href='/user/login' style='text-decoration: none; color: #007bff;'>Sign in to verify your account</a>",
        icon: 'warning'
      });
    } else if (responseBody === 'invalidEmail') {
      Swal.fire(
        { 
          title : 'Email already exist',
          text :'Please consider sign in with existing email' ,
          icon :'error'
        }
    
      )

    } else if (responseBody === 'passwordNotMatch') {
      
    } else if (responseBody === 'invalidPassword') {

    }
  } catch (error) {
    // Handle any errors that occurred during the fetch or server-side processing
    console.error('Error:', error);
    // Display an error message or take appropriate action based on the error
  }
}

// Add an event listener for form submission
var form = document.querySelector('form');
form.addEventListener('submit', (event) => validateForm(event));

var emailInput = document.getElementById("email");
emailInput.addEventListener('input', clearEmailValidity);

var passwordInput = document.getElementById("password");
passwordInput.addEventListener('input', clearPasswordValidity);

var repasswordInput = document.getElementById("repassword");
repasswordInput.addEventListener('input', clearPasswordMatchValidity);

var usernameInput = document.getElementById("username") ; 
usernameInput.addEventListener('input', clearUsernameValidity);


function clearPasswordMatchValidity() {
    var repasswordInput = document.getElementById("repassword");
    repasswordInput.setCustomValidity("");
}


function clearEmailValidity() {
    var emailInput = document.getElementById("email");
    emailInput.setCustomValidity("");
}

function clearPasswordValidity() {
  var passwordInput = document.getElementById("password");
  passwordInput.setCustomValidity("");
}


function clearUsernameValidity(){
  var usernameInput = document.getElementById("username") ; 
  username.setCustomValidity("") ; 
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
    
    function toggleRePasswordVisibility() {
        var repasswordInput = document.getElementById("repassword");
        var repasswordIcon = document.querySelector(".repasswordIcon");
      
        if (repasswordInput.type === "password") {
          repasswordInput.type = "text";
          repasswordIcon.src = "/images/view.png";
        } else {
          repasswordInput.type = "password";
          repasswordIcon.src = "/images/hide.png";
        }
    }