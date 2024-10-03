function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    // Use reverse geocoding to convert lat/long to a readable address (using an API)
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('address').value = data.display_name;
        })
        .catch(error => {
            console.error('Error fetching the address:', error);
            alert("Unable to fetch your location. Please try again.");
        });
}

/////////////////////////dialogue box script
function showDialog() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const address = document.getElementById('address').value;
    const pincode = document.getElementById('pincode').value;
    const paymentMethod = document.getElementById('paymentMethod').value;

    console.log("hello")

    if(username.trim() === "" || email.trim() === "" || phoneNumber.trim() === "" || address.trim() === "" || pincode.trim() === "" || paymentMethod.trim() === ""){
        return alert("Fill all credentials");
    }
 
    const orderData = {
        username: username, 
        email: email,
        phoneNumber: phoneNumber,
        address: address,
        pincode: pincode,
        paymentMethod: paymentMethod 
    };

    placeOrder(orderData);

    document.getElementById('dialogOverlay').style.display = 'block';
    document.getElementById('dialogBox').style.display = 'block';
}

function closeDialog() {
    document.getElementById('dialogOverlay').style.display = 'none';
    document.getElementById('dialogBox').style.display = 'none';
}

function redirectHome() {
    closeDialog();
    window.location.href = '/'; 
}

function placeOrder(orderData) {
    fetch("/placeOrder", {
        method: "POST", 
        headers: {
            "Content-Type": "application/json" 
        },
        body: JSON.stringify(orderData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json(); 
    })
    .then(data => {
        console.log("Success:", data);
        // window.location.href = "/confirmation"; 
    })
    .catch(error => {
        console.error("Error:", error);
    });
}
