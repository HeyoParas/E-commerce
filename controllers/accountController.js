const users = require("../model/user.js");
const bcrypt = require("bcrypt");
const userCarts = require("../model/userCarts.js");
const products = require("../model/product.js");
const userOrderDetails = require("../model/order.js");
const jwt = require("jsonwebtoken");

let forgotOtpCode;
let userEmail;
const { sendOtp } = require("../services/sendOtp.js");
const { forgotOtp } = require("../services/forgotOtp.js");
const product = require("../model/product.js");

async function verifyOtp(req, res) {
  const { username, email, role } = req.session.user;
  const { otp } = req.body;

  let user = await users.findOne({ username: username, email: email });
  console.log("user aya:", user);   
  console.log("user enter otp", user.otp);
  if (user.otp == otp) {  
    user.isVerified = true;
    user.otp = null; 
    if (email == "parasnegi4143@gmail.com") {
      user.isAdmin = true; 
      user.role = "admin";
    }
    await user.save();
      
    return res.render("login", { message: null });
  } else {
    // Handle incorrect OTP
    console.log("Incorrect OTP:", otp);
    return res.render("verifyOtp", {
      message: "Invalid OTP. Please try again.",
    });
  }
}

async function slash(req, res) {
  // console.log(req.session.user)
  const token = req.cookies.token || null;
  let productImg = await products.find({}).limit(5);
  if (token) {
    const user = jwt.verify(token, "pygrl00y8");
    console.log("user'username:", user.username);
    let checkAdmin = await users.findOne({
      $and: [{ username: user.username }, { isAdmin: true }],
    });
    if(user.role=="seller")
    {
      console.log("0");
      return res.render("user", {
        isLoggedin: true,
        username: user.username,
        images: productImg,
        role:user.role
      });
    }
    if (checkAdmin) {
      if (req.query.message) {
        console.log("1")
        return res.render("admin", {
          isAdmin: true,
          isLoggedin: true,
          username: user.username,
          images: productImg,
          message: true,
        });
      }
      console.log("2")
      return res.render("admin", {
        isAdmin: true,
        isLoggedin: true,
        username: user.username,
        images: productImg,
      });
    }
    if (req.query.message) {
      console.log("3")
      return res.render("user", {
        isLoggedin: true,
        username: user.username,
        images: productImg,
        message: true,
        role:user.role
      });
    }
    console.log("4")
    return res.render("user", {
      isLoggedin: true,
      username: user.username,
      images: productImg,
      role:user.role
    });
  }
  console.log("5")
  return res.render("home", {
    isLoggedin: false,
    username: null,
    images: productImg,
  });
}

async function forgotPassword(req, res) {
  userEmail = req.body.email;
  console.log("reqbody", req.body);
  console.log("user email :", userEmail);

  forgotOtpCode = Math.floor(1000 + Math.random() * 9000);
  console.log("sent otp : ", forgotOtpCode);

  let user = await users.findOne({ email: userEmail });
  console.log("user:", user);
  if (user) {
    await forgotOtp(userEmail, forgotOtpCode);
    return res.redirect(`/verifyForgotOtp`); //?email=${userEmail}
  } else {
    return res.render("forgotPassword", { message: "User not registered" });
  }
}

async function verifyForgotOtp(req, res) {
  console.log("forgotOtpCode:", forgotOtpCode);
  let otp = req.body.otp;
  if (forgotOtpCode != otp) {
    return res.render("verifyForgotOtp", {
      message: "Invalid Otp! Please try again",
    });
  } else {
    return res.redirect("/resetPassword");
  }
}

async function resetPassword(req, res) {
  console.log("req body:", req.body);
  let { newPassword, confirmPassword } = req.body;
  console.log("2no cheeje :", newPassword, confirmPassword);
  let user = await users.findOne({ email: userEmail });
  if (!user) {
    return res.render("resetPassword", { message: "Invalid Email" });
  }
  if (newPassword != confirmPassword) {
    return res.render("resetPassword", { message: "Password not matched!" });
  } else {
    const salt = await bcrypt.genSalt(10);
    const saltedPassword = await bcrypt.hash(newPassword, salt);
    console.log("newSaltedPassword:", saltedPassword);
    let user = await users.updateOne(
      { email: userEmail },
      { $set: { password: saltedPassword } }
    );
    console.log(
      "user after changing password:",
      await users.findOne({ email: userEmail })
    );
    return res.redirect("login?message=Password%20reset%20successfully.");
  }
}

async function addToCart(req, res) {
  try {
    const pId = req.body.productId;
    console.log("Product ID received:", pId);

    const token = req.cookies.token || null;
    const decoded = jwt.verify(token, "pygrl00y8");
    console.log("token:", decoded);
    let username = decoded.username;
    // console.log(username)

    let userCart = await userCarts.findOne({ username: username });
    console.log("yo usercart:", userCart);
    if (userCart == null) {
      userCart = await userCarts.create({
        username: username,
        products: [{ productId: pId, quantity: 1 }],
      });
      await userCart.save();
      return;
    }

    let productArray = userCart.products;
    console.log("productArray:", productArray);

    let selectedProduct = productArray.filter((p) => p.productId == pId);
    console.log("selectedProduct :", selectedProduct);

    let userproduct = await products.find({ _id: pId });
    console.log("userproduct:", userproduct);
    let productStock = userproduct[0].stock;
    console.log("productStock:", productStock);

    // if(productStock)
    if (!userCart) {
      // Create a new cart for the user if it doesn't exist
      userCart = await userCarts.create({
        username: username,
        products: [{ productId: pId, quantity: 1 }],
      });
      await userCart.save();
      console.log("huainsert:", userCart);
    } else {
      console.log("User cart found:", userCart);
      const products = userCart.products;

      // Check if the product already exists in the cart
      const productIndex = products.findIndex(
        (product) => product.productId === pId
      );

      if (productIndex !== -1) {
        // Product exists, increment the quantity
        if (selectedProduct[0].quantity >= productStock) {
          return res.json({ isOutOfStock: true });
        }
        products[productIndex].quantity += 1;
        // console.log(`Quantity incremented for product ${pId}`);
      } else {
        // Product doesn't exist, add it with quantity 1
        products.push({ productId: pId, quantity: 1 });
        console.log("New product added to the cart");
      }
      userCart.products = products;
      // Save the updated cart
      await userCart.save();
      if (selectedProduct[0].quantity >= productStock) {
        return res.json({ isOutOfStock: true });
      }
      console.log("Product added to cart");
    }

    res.status(200).json({ message: "Product added to cart", pId });
  } catch (error) {
    console.error("Error adding product to cart:", error);
    res.status(500).json({ message: "Server error" });
  }
}

async function loadMoreImages(req, res) {
  const page = parseInt(req.query.page) || 10;

  let product = await products.find({});
  let img = product.map((element) => {
    return {
      src: element.src,
      _id: element._id,
    };
  });
  console.log("img:", img);

  const moreImages = img.slice(page - 5, page);
  console.log("moreImages", moreImages);
  // Check if there are more images to load
  if (moreImages.length) {
    return res.json({ images: moreImages });
  } else {
    return res.status(404).json({ message: "No more images to load" });
  }
}

async function productData(req, res) {
  const productId = req.params.id;
  let product = await products.find({ _id: productId });
  if (product) {
    console.log("produc ki details:", product);
    res.json(product);
  } else {
    res.status(404).json({ message: "Product not found" });
  }
}

async function removeProductFromCart(req, res) {
  const pId = req.params.pId;
  console.log("pID aai:", pId);
  const token = req.cookies.token || null;
  const user = jwt.verify(token, "pygrl00y8");
  // console.log(user.username);
  let loggedPerson = user.username;
  let userCart = await userCarts.findOne({ username: loggedPerson });
  // console.log("user ki cart:",userCart);
  // console.log("usercart :", userCart);
  let productsArray = userCart.products;
  // console.log("productArray", productsArray)

  let productQuantity = productsArray.find((p) => p.productId === pId);

  console.log("this is the quantity:", productQuantity.quantity);

  let allProducts = await products.find({});
  // console.log("this is all ",allProducts)
  let product = allProducts.find((p) => pId == p._id);
  console.log("productPrice here:", product.price);

  let result = productsArray.filter((index) => index.productId != pId);

  userCart.products = result;
  // console.log("usercart :", userCart);

  await userCart.save();
  return res.json({
    message: "Product removed from cart successfully!",
    price: product.price,
    quantity: productQuantity.quantity,
  });
}

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

async function subQuantity(req, res) {
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
  console.log("user ki cart:", userCart);
  let productsArray = userCart.products;
  console.log("productArray", productsArray);

  let allProducts = await products.find({});
  console.log("this is all ", allProducts);
  let product = allProducts.find((p) => pId == p._id);
  console.log("productPrice here:", product.price); 

  let result = productsArray.map((product) => {
    if (product.productId == pId) {
      product.quantity = quantity;
    }
    return product;
  });
  console.log("result wala array:", result);

  userCart.products = result;
  console.log("usercart :", userCart);

  await userCart.save();
  return res.json({
    message: "Product removed to cart successfully!!!",
    price: product.price,
  });
}

async function adminProfile(req, res) {
  const token = req.cookies.token || null;
  // console.log(token)
  const user = jwt.verify(token, "pygrl00y8");
  console.log(user);
  let allProduct = await products.find({});
  // console.log("productImg", allProduct);
  if (token) {
    let checkAdmin = await users.findOne({
      $and: [{ username: user.username }, { isAdmin: true }],
    });
    // console.log("checkAdmin:",checkAdmin)
    if (checkAdmin) {
      return res.render("adminProfile", {
        isAdmin: true,
        isLoggedin: true,
        username: user.username,
        allProduct: allProduct,
        email: user.email,
      });
    }
  }
  return res.render("adminProfile", {
    username: user.username,
    email: user.email,
  });
}

async function userProfile(req, res) {
  const token = req.cookies.token || null;
  const user = jwt.verify(token, "pygrl00y8");
  console.log(user);
  let productImg = await products.find({});
  // console.log("productImg",productImg)
  if (token) {
    let checkAdmin = await users.findOne({
      $and: [{ username: user.username }, { isAdmin: true }],
    });
    // console.log("checkAdmin:",checkAdmin)
    if (checkAdmin) {
      return res.render("userProfile", {
        isAdmin: true,
        isLoggedin: true,
        username: user.username,
        images: productImg,
        email: user.email,
      });
    }
  }
  return res.render("userProfile", {
    username: user.username,
    email: user.email,
  });
}

async function sellerProfile(req,res){
  const token = req.cookies.token || null;
  const user = jwt.verify(token, "pygrl00y8");
  console.log(user);
  let productImg = await products.find({});
  // console.log("productImg",productImg)
  if (token) {
    let checkAdmin = await users.findOne({
      $and: [{ username: user.username }, { isAdmin: true }],
    });
    // console.log("checkAdmin:",checkAdmin)
    if (checkAdmin) {
      return res.render("userProfile", {
        isAdmin: true,
        isLoggedin: true,
        username: user.username,
        images: productImg,
        email: user.email,
      });
    }
  }
  if(user.role=="user"){
  return res.render("userProfile", {
    username: user.username,
    email: user.email,
    role:user.role
  });
}
return res.render("sellerProfile", {
  username: user.username,
  email: user.email, 
  role:user.role
});
}

async function removeProduct(req, res) {
  const pId = req.params.pId;
  console.log(pId);
  await products.deleteOne({ _id: pId });
  return res.status(200).json({ message: "Product removed successfully" });
}

async function updateProduct(req, res) {
  const pId = req.params.pId;
  console.log("pId :", pId);
  console.log(req.body);
  const { productName, description, price, stock } = req.body;
  console.log(productName, description, price, stock);
  const updatedDoc = await products.findOneAndUpdate(
    { _id: pId },
    {
      $set: {
        productNmae: productName,
        description: description,
        price: price,
        stock: stock,
      },
    },
    { new: true } // updated doc return krega
  );
  console.log(updatedDoc);
  return res
    .status(200)
    .json({ message: "Product details changed successfully" });
}

async function addProduct(req, res) {
  // console.log("file data :",req.file);
  // console.log("file data path :",req.file.path);

  console.log("req.body", req.body);
  const { productName, description, price, stock } = req.body;
  const src = req.file.originalname;
  console.log(productName, description, price, stock, src);

  if (productName && description && price && stock && src) {
    let newProduct = await products.create({
      productNmae: productName,
      description: description,
      price: price,
      src: src,
      stock: stock,
    });
    console.log("newProduct:", newProduct);
    await newProduct.save();
    return res.status(200).redirect("/");
  }
  return res.json({ message: "Less credentials" });
}

async function getCart(req, res) {
  console.log(req.body);
  const token = req.cookies.token || null;
  const user = jwt.verify(token, "pygrl00y8");
  // console.log(user.username);
  let loggedPerson = user.username;
  let userCart = await userCarts.findOne({ username: loggedPerson });
  // console.log("user ki cart:",userCart);
  // console.log("usercart :", userCart);
  if (userCart == null) {
    return res.json({ empty: "Your Cart is empty!!" });
  }
  let productsArray = userCart.products;
  // console.log("productArray", productsArray);
  let allProduct = await products.find({});
  // console.log("Allproducts :", allProduct);

  let arr = [];
  for (let i = 0; i < productsArray.length; i++) {
    for (let j = 0; j < allProduct.length; j++) {
      if (productsArray[i].productId == allProduct[j]._id) {
        arr.push({
          _id: allProduct[j]._id,
          productName: allProduct[j].productNmae,
          src: allProduct[j].src,
          description: allProduct[j].description,
          price: allProduct[j].price,
          quantity: productsArray[i].quantity,
          stock:allProduct[j].stock,
          userId: userCart._id,
        });
        break;
      }
    }
  }
  // console.log("finally array that i want-->", arr);
  if (!arr.length) {
    return res.json({ empty: "Your Cart is empty!!" });
  }

  res.json({ arr: arr });
}

async function login(req, res) {
  try {
    const { username, password} = req.body;
    console.log(username, password)
    let user = await users.findOne({ username: username });
    console.log(user)
    console.log("user.isverified :", user.isVerified);
    if (user.isVerified === false) {
      console.log("i m in");
      await users.deleteOne({ isVerified: false });
      return res.render("login", {
        message1: "Invalid Username",
        message2: "Invalid Password",
      });
    }
    if (!user) {
      return res.render("login", {
        message1: "Invalid Username",
        message2: "Invalid Password",
      });
    }

    let isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      let token = jwt.sign(
        {
          username: user.username,
          email: user.email,
          isLoggedin: true,
          role: user.role,
        },
        "pygrl00y8"
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        maxAge: 60 * 60 * 24 * 1000,
      });

      res.redirect(`/`);
    } else {
      // Invalid password
      return res.render("login", { message2: "Invalid password" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).render("login", {
      message1: "Invalid Username",
      message2: "Invalid Password",
    });
  }
}

async function signUp(req, res) {
  const { username, email, password, role } = req.body;

  if(username.trim()==""){
    return res.render("signUp", { message: "Invalid username" });
  }
  // Check if the user already exists based on username and email
  let user = await users.findOne({
    $or: [{ username: username }, { email: email }],
  });
  console.log("user:", user);
  if (user) {
    if (username == user.username && email != user.email)
      return res.render("signUp", { message: "Username already exist" });
  }

  if (!user) {
    try {
      // Generate a salt
      const salt = await bcrypt.genSalt(10);
      // Hash the password with the salt
      const saltedPassword = await bcrypt.hash(password, salt);

      // Generate a random 4-digit OTP
      const otp = Math.floor(1000 + Math.random() * 9000);
      console.log("sent otp : ", otp);

      // Send OTP to the user's email
      await sendOtp(email, otp);

      // Create a new user record
      let newUser = await users.create({
        username: username,
        email: email,
        password: saltedPassword,
        role: role,
        otp: otp,
      });

      req.session.user = newUser;

      return res.redirect("/verifyOtp");
    } catch (error) {
      console.error("Error during sign up:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    // Handle case where user already exists
    return res.render("signUp", { message: "User already exists" });
  }
}

async function changePassword(req, res) {
  console.log(req.body);
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const token = req.cookies.token || null;
  const user = jwt.verify(token, "pygrl00y8");
  console.log("user'username:", user.username);
  const userInfo = await users.findOne({ email: user.email });
  console.log("userinfo", userInfo);
  let originalPassword = await bcrypt.compare(oldPassword, userInfo.password);
  console.log("originalpas", originalPassword);
  if (originalPassword) {
    if (newPassword == confirmPassword) {
      const salt = await bcrypt.genSalt(10);
      const saltedPassword = await bcrypt.hash(newPassword, salt);
      console.log(saltedPassword);
      userInfo.password = saltedPassword;
      // console.log("userinfo:",userInfo)
      await userInfo.save();
      res.clearCookie("token");
      return res.redirect("/login?message=Password%20changed%20successfully");
    } else {
      return res.render("changePassword", { mssg2: "Password not matched" });
    }
  } else {
    console.log("yo");
    return res.render("changePassword", { mssg1: "Incorrect Password" });
  }

  // res.json({success:true})
}

async function isLogedIn(req, res) {
  const token = req.cookies.token || null;

  if (token) {
    res.json(true);
  } else {
    res.json(false);
  }
}

async function getLogin(req, res) {
  if (req.query.message) {
    res.render("login", { successMessage: req.query.message });
  } else {
    res.render("login");
  }
}

async function proceedToBuy(req, res) {
  const userId = req.params.userId;
  console.log(userId);
  const token = req.cookies.token || null;
  const user = jwt.verify(token, "pygrl00y8");
  console.log("user'username:", user.username);
  const userCart = await userCarts.findOne({ username: user.username });
  // console.log(userCart);
  const productsExists = userCart.products.filter(
    (product) => product.quantity !== 0
  );
  console.log("productExists", productsExists);
  if (productsExists.length == 0) {
    console.log("hiiii");
    return res.redirect("/?message=true");
  }
  let allProduct = await products.find({});
  // console.log(allProduct)
  const matchedProducts = [];

  for (let i = 0; i < productsExists.length; i++) {
    for (let j = 0; j < allProduct.length; j++) {
      if (productsExists[i].productId == allProduct[j]._id) {
        const matchedProduct = {
          productName: allProduct[j].productNmae,
          quantity: productsExists[i].quantity,
          price: allProduct[j].price * productsExists[i].quantity,
        };
        matchedProducts.push(matchedProduct);
      }
    }
  }
  console.log(matchedProducts);
  let totalAmount = 0;
  for (let i = 0; i < matchedProducts.length; i++) {
    totalAmount += matchedProducts[i].price;
  }
  // console.log(totalAmount)
  return res.render("proceedToBuy", {
    orderItems: matchedProducts,
    totalAmount: totalAmount,
  });
}

async function placeOrder(req, res) {
  // console.log("req.body",req.body);
  const { username, email, phoneNumber, address, pincode, paymentMethod } =
    req.body;
  // console.log(username,email,phoneNumber,address,pincode,paymentMethod)
  const token = req.cookies.token || null;
  const decode = jwt.verify(token, "pygrl00y8");
  // console.log("user'username:", decode.username);
  let user = await users.findOne({ username: decode.username });
  // console.log(user)
  let userId = user._id;
  // console.log("userId",userId)
  let userCart = await userCarts.findOne({ username: decode.username });
  // console.log("userCart",userCart)
  const productsExists = userCart.products.filter(
    (product) => product.quantity !== 0
  );
  // console.log("product exists:",productsExists)
  let allProduct = await products.find({});
  const matchedProducts = [];
  let totalItem = 0;
  for (let i = 0; i < productsExists.length; i++) {
    for (let j = 0; j < allProduct.length; j++) {
      if (productsExists[i].productId == allProduct[j]._id) {
        const matchedProduct = {
          productId: allProduct[j]._id.toString(),
          productName: allProduct[j].productNmae,
          quantity: productsExists[i].quantity,
          productPrice: allProduct[j].price,
        };
        totalItem++;
        matchedProducts.push(matchedProduct);
      }
    }
  }
  let totalAmount = 0;
  for (let i = 0; i < matchedProducts.length; i++) {
    totalAmount +=
      matchedProducts[i].productPrice * matchedProducts[i].quantity;
  }
  // console.log("totalItem:",totalItem)
  // console.log("total",totalAmount)

  let newUserOrderDetail = await userOrderDetails.create({
    userId: userId,
    totalAmount: totalAmount,
    totalItem: totalItem,
    userOrderDetails: {
      username: username,
      phoneNumber: phoneNumber,
      email: email,
      address: address,
      pincode: pincode,
      paymentMethod: paymentMethod,
    },
    userOrderCart: matchedProducts,
  });

  await userCarts.findOneAndDelete({ username: decode.username });
  console.log("matchedProducts : ", matchedProducts);

  for (let i = 0; i < matchedProducts.length; i++) {
    for (let j = 0; j < allProduct.length; j++) {
      if (matchedProducts[i].productId == allProduct[j]._id) {
        const newStock = allProduct[j].stock - matchedProducts[i].quantity;

        await products.updateOne(
          { _id: allProduct[j]._id },
          { $set: { stock: newStock.toString() } }
        );
        break;
      }
    }
  }
}
module.exports = {
  verifyOtp,
  login,
  signUp,
  forgotPassword,
  verifyForgotOtp,
  resetPassword,
  addToCart,
  loadMoreImages,
  productData,
  slash,
  getCart,
  removeProductFromCart,
  addQuantity,
  subQuantity,
  adminProfile,
  userProfile,
  sellerProfile,
  removeProduct,
  updateProduct,
  addProduct,
  proceedToBuy,
  changePassword,
  isLogedIn,
  getLogin,
  placeOrder,
};
