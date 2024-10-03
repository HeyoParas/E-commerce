const viewDetailButtons = document.querySelectorAll('.view-detail-btn');
const dialogBox = document.getElementById('dialog-box');
const closeButton = document.getElementById('close-btn');
const itemContainer = document.querySelector('.item-container');
let cartBtn = document.querySelector('.cart-btn');

let page = 5; // Initial page for loading more images
  
document.getElementById('load-more-btn').addEventListener('click', function () {
  page=page+5; 

  fetch(`/load-more-images?page=${page}`)
    .then(response => {
      return response.json();
    })
    .then(data => {
      if(data.message)
      {
        return alert("No more Products");
      }
      console.log("here the data:",data)
      console.log("here the data.images:",data.images)
      if (data.images && data.images.length>0) {
        const itemContainer = document.querySelector('.item-container');
        data.images.forEach(element => {
          const newItem = document.createElement('div');
          newItem.classList.add('item');
          newItem.innerHTML = `
            <img src="${element.src}" alt="" />
            <div class="funButton">
              <button class="view-detail-btn" id="${element._id}">View Detail</button>
              <button class="add-to-cart-btn" id="${element._id}">Add To Cart</button>
            </div>`;
          itemContainer.appendChild(newItem);
        });
      } else {
        console.log('No more images to load');
      }
    })
    .catch(err => {
      console.error('Error heloading images:', err);
    });
});

//event listener to the parent container taki event ke madad se item pick kr ske
itemContainer.addEventListener('click', function(event) {
  // Check if the clicked element is a "View Detail" button
  if (event.target && event.target.classList.contains('view-detail-btn')) {
    console.log("event target: ",event.target);

    //for fetch the data for the particular product
    let btnId = event.target.id;
    console.log(btnId);

    fetchProductData(btnId)

    dialogBox.style.display = 'block'; // Show dialog box
    itemContainer.classList.add('blur-background'); // Blur the background items

    // Add overlay behind the modal
    let overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);
  }

  //------------------------------------------

  
  //checked if the clicked element is a "add-to-cart-btn"
  if (event.target && event.target.classList.contains('add-to-cart-btn')) {
    console.log("event target: ", event.target.classList.contains('add-to-cart-btn'));

   checkUserIsLoginOrNot().then(res=>{
     console.log("result aya",res);
     if(res==true)
     {
      console.log("hiiii")
      let productId = event.target.id;
      console.log(productId);
      console.log("idhr huuu")
      alert("Added to Cart");
      addToCartProduct(productId);
     }
     if(res==false)
     {
      alert("Login first!!");
      window.location.href = '/login';
     }
   });
  }
});

cartBtn.addEventListener('click',()=>{
  checkUserIsLoginOrNot().then(res=>{
    console.log("result:::::::::::",res);
    if(res==true)
    {
      console.log("hi i am cart btn and i am login")
      window.location.href = '/usercart';
    }
    else{
      console.log("hi i am cart btn and i am not login in");
      alert("login first!");
      window.location.href = '/login';
    }
  });
})

// Function to close the dialog box
closeButton.addEventListener('click', function() {
  dialogBox.style.display = 'none'; // Hide dialog box
  itemContainer.classList.remove('blur-background'); // Remove blur from the background items

  // Remove overlay
  const overlay = document.querySelector('.overlay');
  if (overlay) {
    overlay.remove();
  }
});

//check user is logged in or not for add to cart functionality.
function checkUserIsLoginOrNot()
{
  return fetch("/isLogedIn")
  .then(response=>{
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data=>{
    console.log("islogedin data:",data);
    return data;
  })
  .catch(error => {
    console.error('Fetch error:', error);
  });
}


function fetchProductData(productId) {
  fetch(`/productData/${productId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Product data:', data);
      console.log(data[0].productNmae)
      
      //update the dialog box with product details
      const productDetailContainer = document.querySelector(".product-details");
      console.log("productDetailContainer:",productDetailContainer)
      productDetailContainer.innerHTML = `
        <img src="${data[0].src}" alt="">
        <h2>${data[0].productNmae}</h2>
        <p>Description: ${data[0].description}</p>
        <h4>$${data[0].price}</h4>
      `;
    })
    .catch(error => {
      console.error('Fetch error:', error);
    });
}

function addToCartProduct(productId) {
  fetch('/addToCart', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ productId}) 
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if(data.isOutOfStock == true){
     return alert("Out Of stock!!");
      }
      return alert("Added to Cart");
    })
    .catch(error => {
      console.error('Fetch error:', error);
    });
}

////////////////////////////////////////////////////////////////////////////

