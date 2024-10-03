let cartContainer = document.querySelector(".cart-container");

let div = document.createElement("div");
div.classList.add("product-container");

let addBtn = document.querySelector(".add");
let subBtn = document.querySelector(".sub");
let quantity = document.querySelector(".quantity");
let removeBtn = document.querySelector(".remove-product");
let totalProducts=document.getElementById("total-products")
let totalPrice=document.getElementById("total-price")
let proceedToBuyBtn = document.querySelector(".proceed-to-buy");
let noOfProducts=0;
let grandTotal=0;

function addProductToCart(product) {
  console.log("product",product)
  let div = document.createElement("div");
  div.classList.add("product-container");
 
  div.innerHTML = `
        <div class="product">
            <img src="${product.src}" alt="${product.productName}">
            <div>
                <h3>${product.productName}</h3>
                <p>${product.description}</p>
                <span>Price: $${product.price}</span>
            </div>
        </div>
        <div class="funButton">
            <div style="display: flex;">
                <button class="sub" id=${product._id}>-</button>
                <span class="quantity">${product.quantity}</span>
                <button class="add" id=${product._id}>+</button>
            </div>
            <button class="remove-product" id=${product._id}>Remove</button>
        </div>`;

  proceedToBuyBtn.id=product.userId;

  cartContainer.append(div);
  noOfProducts++;
  totalProducts.innerText=noOfProducts;
  grandTotal = grandTotal+product.price*product.quantity;
  totalPrice.innerText=grandTotal;
  // if(grandTotal==0){
  //   noOfProducts=0;
  //   totalProducts.innerText=noOfProducts;
  // }

  div.querySelector(".add").addEventListener("click", (event) => {
    console.log("add button cliked");
    console.log(product);
    let quantity=++product.quantity;
    console.log("product stock available:",product.stock)
    if(product.quantity>product.stock){
      product.quantity--;
      quantity--;
      return alert("Product out of stock!");
    }
    console.log("current quantity:",quantity);
    let pId = event.target.id;
    console.log("this is the product id :", pId);

    fetch(`/addQuantity/${pId}/${quantity}`)
    .then((response) => response.json())
    .then((res) =>{ 
      console.log("response aya through fetch",res)
      if(res.isOutOfStock==true)
        {
          quantity--;
          console.log("huaa :",quantity)
         return alert("Out of stock");
        }
      console.log(res);
      if(!res.isOutOfStock){
      grandTotal += res.price;
      totalPrice.innerText=grandTotal;
      }
        div.querySelector(".quantity").textContent = quantity;
    })
    .catch((error) => console.error("Error adding quantity:", error));
  });


  
  div.querySelector(".sub").addEventListener("click", (event) => {
    // Decrement logic
    if (product.quantity != 0) {
      let quantity=--product.quantity;
      console.log(quantity);
      let pId = event.target.id;
        div.querySelector(".quantity").textContent = quantity;
        fetch(`/subQuantity/${pId}/${quantity}`)
        .then((response) => response.json())
        .then((res) => 
          {
            console.log("hii")
            console.log(res);
            grandTotal -= res.price;
            totalPrice.innerText=grandTotal;
          })
        .catch((error) => console.error("Error adding quantity:", error));
    }
    else{
      console.log("hi")
      noOfProducts=0;
      totalProducts.innerText=noOfProducts;
      let pId = event.target.id;
      console.log("this is the product id :", pId);
  
      fetch(`/removeProductFromCart/${pId}`)
        .then((response) => response.json())
        .then((res) => {
          console.log("res",res);
          grandTotal = grandTotal-(res.price*res.quantity);
          totalPrice.innerText=grandTotal;
       })
        .catch((error) => console.error("Error fetching cart data:", error));

        console.log("hello")
    }

});


  div.querySelector(".remove-product").addEventListener("click", (event) => {
    let pId = event.target.id;
    console.log("this is the product id :", pId);

    fetch(`/removeProductFromCart/${pId}`)
      .then((response) => response.json())
      .then((res) => 
        {
          console.log(res);
          grandTotal = grandTotal-(res.price*res.quantity);
          totalPrice.innerText=grandTotal;
        })
      .catch((error) => console.error("Error fetching cart data:", error));
    div.remove();
        noOfProducts--;
        totalProducts.innerText=noOfProducts;

      const products = document.querySelectorAll('.product-container');
      console.log("heee")
      console.log(products)
      if (products.length === 0) {
          // If no products, display "Your cart is empty" message
          const emptyMessage = "Your cart is empty!!";
          displayCartIsEmpty(emptyMessage)
      }

  });

    proceedToBuyBtn.addEventListener('click',(event)=>
  {
      let userId = event.target.id;
      console.log(userId);
      window.location.href=`/proceedToBuy/${userId}`;
  })  
}

function displayCartIsEmpty(message) {
  let div = document.createElement("div");

  div.innerHTML = `<center><h1 style="margin-top:10%">${message}</h1></center>`;

  cartContainer.append(div);

  proceedToBuyBtn.addEventListener('click',(event)=>
    {
        if(message){
          return alert("Cart is empty!!")
        }
    }) 
}

fetch("/getCart")
  .then((response) => response.json()) 
  .then((cartData) => {
    console.log("cartData aya :", cartData);
    if (cartData.arr) {
      cartData.arr.forEach((product) => {
        addProductToCart(product);
      });
    }
    if(cartData.empty){
    return displayCartIsEmpty(cartData.empty);
    }
  })
  .catch((error) => {
    console.error("Error fetching cart data:", error);
  });


