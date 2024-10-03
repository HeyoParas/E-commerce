let editDetailBtn = document.querySelectorAll(".edit-detail-btn");
let removeProductBtn = document.querySelectorAll(".remove-product-btn");
let itemContainer = document.querySelector(".item-container");

let addProductBtn = document.querySelector(".add-product-btn");

addProductBtn.addEventListener('click',()=>{
  console.log("jiiii");
  window.location.href = '/addProduct';
})

let changePassBtn=document.querySelector(".change-password");

changePassBtn.addEventListener("click",(e)=>{
    console.log(changePassBtn)
    window.location.href="/changePassword";
})

editDetailBtn.forEach((btn) => {
  btn.addEventListener("click", (event) => {
    console.log("editdetailbtn");
    const item = event.target.closest(".item"); 

    let productName = item.querySelector("#productName").value;
    let description = item.querySelector("#description").value;
    let price = item.querySelector("#price").value;
    let stock = item.querySelector("#stock").value;
    let pId = event.target.id;
    // console.log(pId);
    updateProduct(productName,description,price,stock,pId);
  });
});



removeProductBtn.forEach((btn) => {
  btn.addEventListener("click", (event) => {
    let pId = event.target.id;
    //console.log(pId);
    //console.log("removeproductbtn");
    removeProduct(pId);
    let item = event.target.parentNode;
    //console.log(item);
    item.remove();
  });
});

function removeProduct(pId) {
  fetch(`/removeProduct/${pId}`)
    .then((response) => response.json())
    .then((res) => {
      if (res.message) {
        alert("Product removed successfully");
        //console.log(res.message);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function updateProduct(productName,description,price,stock,pId){

  let productObject = {
    productName:productName,
    description:description,
    price:price,
    stock,stock
  }
  //console.log("hiiiiiiiiiiiiiiiiiiiii")
  fetch(`/updateProduct/${pId}`, {
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(productObject) 
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json(); 
    })
    .then(data => {
      //console.log('Success:', data);
      alert("Product updated successfully");
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });

}
