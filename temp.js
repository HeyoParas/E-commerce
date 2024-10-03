async function addQuantity(req, res) {
    const pId = req.params.pId;
    const quantity = parseInt(req.params.quantity);
    // console.log("pID aai:", pId);
    console.log("quantity aai:", quantity);
    // console.log("Type of quantity:", typeof quantity);
    const token = req.cookies.token || null;
    const user = jwt.verify(token, "pygrl00y8");
    // console.log(user.username);
    let loggedPerson = user.username;
    let userCart = await userCarts.findOne({ username: loggedPerson });
    // console.log("usercart :", userCart);
    let productsArray = userCart.products;
    // console.log("productArray", productsArray);
    let userproduct = await products.find({ _id: pId });
    console.log("userproduct:",userproduct);
    let productStock = userproduct[0].stock;
    console.log("productStock:", productStock);
  
    let productPrice = userproduct[0].price;
    console.log("this is the price:", productPrice);
    if(quantity > productStock){
      return res.json({ message: "product Out of Stock", isOutOfStock: true });
    }
    // console.log("allproductList:",allProductList);
    if (quantity <= productStock) {
      console.log("hiiiiiii");
      let result = productsArray.map((product) => {
        if (product.productId == pId) {
          product.quantity = quantity;
        }
        return product;
      });
      userCart.products = result;
      console.log("user ki cart after update:", userCart);
      await userCart.save();
    } else {
      return res.json({ message: "product Out of Stock", isOutOfStock: true });
    }
    // console.log("result wala array:",result);
  
    // console.log("usercart :", userCart);
  
    return res.json({
      message: "Product added to cart successfully!",
      price: productPrice,userCart:userCart
    });
  }







  div.querySelector(".add").addEventListener("click", (event) => {
    // Increment logic
    let quantity=++product.quantity;
    console.log("hi")
    console.log(quantity);
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
  // console.log("hellllllllll")
  console.log("productquantity",product.quantity)
  if(product.quantity==1){
    return;
  }
  if (product.quantity>1) {
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
  // else{
  //   console.log("hi")
  //   noOfProducts=0;
  //   totalProducts.innerText=noOfProducts;
  //   let pId = event.target.id;
  //   console.log("this is the product id :", pId);

  //   fetch(`/removeProductFromCart/${pId}`)
  //     .then((response) => response.json())
  //     .then((res) => {
  //       console.log("res",res);
  //       grandTotal = grandTotal-(res.price*res.quantity);
  //       totalPrice.innerText=grandTotal;
  //    })
  //     .catch((error) => console.error("Error fetching cart data:", error));
  
  //     console.log("hello") 
  // }

});