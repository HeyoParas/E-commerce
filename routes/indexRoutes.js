const express = require("express");
const router = express.Router();
// const jwt = require("jsonwebtoken");
// const path = require("path");
const accountController = require("../controllers/accountController.js");
const {upload,fileMid,mid} = require("../middleware/middleware.js")

    router.get("/addProduct",(req, res) => res.render("addProduct")) 
    
    router.post('/addProduct', upload.single('image'), fileMid, accountController.addProduct);


router.get("/adminProfile",accountController.adminProfile)
router.get("/userProfile",accountController.userProfile)
router.get("/sellerProfile",accountController.sellerProfile)


router.get("/addQuantity/:pId/:quantity",accountController.addQuantity)
router.get("/subQuantity/:pId/:quantity",accountController.subQuantity)
router.get("/removeProductFromCart/:pId",accountController.removeProductFromCart)

router.get("/", accountController.slash);


router.get("/load-more-images", accountController.loadMoreImages);
router.get("/productData/:id", accountController.productData);

router.get("/removeProduct/:pId",accountController.removeProduct)


router.get("/proceedToBuy/:userId",accountController.proceedToBuy)


router.get("/changePassword",(req,res)=>res.render("changePassword"));
router.post("/changePassword",accountController.changePassword)


router.get("/isLogedIn",accountController.isLogedIn);

router.get("/login", mid, accountController.getLogin);



router.get("/usercart",(req,res)=>{
    res.render("userCart", {Message: req.query.message });
});
router.get("/getCart",accountController.getCart)
router.get("/forgotPassword", mid, (req, res) => res.render("forgotPassword"));
router.get("/SignUp", mid, (req, res) => res.render("SignUp"));
router.get("/verifyOtp", mid, (req, res) =>
  res.render("verifyOtp", { message: null })
);
router.get("/verifyForgotOtp", mid, (req, res) =>
  res.render("verifyForgotOtp", { message: null })
);
router.get("/resetPassword", mid, (req, res) => res.render("resetPassword"));
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.clearCookie("sessionId");
  res.redirect("/login");
});

//<------------------------------------------------------------------------->
router.post('/updateProduct/:pId',accountController.updateProduct);
router.post('/addToCart', accountController.addToCart);
router.post("/verifyOtp", accountController.verifyOtp);
router.post("/verifyForgotOtp", accountController.verifyForgotOtp);
router.post("/signUp", accountController.signUp);
router.post("/login", accountController.login);
router.post("/forgotPassword", accountController.forgotPassword);
router.post("/resetPassword", accountController.resetPassword);

///
router.post("/placeOrder",accountController.placeOrder);

module.exports = router;
    