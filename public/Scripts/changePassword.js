function func(){
    var passwordField = document.getElementById("oldPassword");
    if (passwordField.type === "password") {
      passwordField.type = "text";
    } else {
      passwordField.type = "password";
    }
     }
function func2(){
    var passwordField = document.getElementById("newPassword");
    if (passwordField.type === "password") {
      passwordField.type = "text";
    } else {
      passwordField.type = "password";
    }
     }
function func3(){
    var passwordField = document.getElementById("confirmPassword");
    if (passwordField.type === "password") {
      passwordField.type = "text";
    } else {
      passwordField.type = "password";
    }
     }



     document.querySelector('change-password-btn').addEventListener('click', () => {
        const formData = {
            oldPassword: document.getElementById('oldPassword').value,
            newPassword: document.getElementById('newPassword').value,
            confirmPassword: document.getElementById('confirmPassword').value,
        }
    
        fetch('/changePassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            return response.json(); 
        })
        .then(result => {
            alert(result.message || "Password changed successfully!");
  
        })
        .catch(error => {
            console.error('Error:', error);
            alert(error.message || "An unexpected error occurred.");
        });
    });
    