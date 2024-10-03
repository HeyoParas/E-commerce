const multer = require('multer');
const path = require('path');
const dest = multer({ dest: 'public/' })


// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public');
  },
  filename: function (req, file, cb) {
    const fn = file.originalname;
    cb(null, fn);
  }
});

// File filter to validate file type
const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  if (extension !== ".jpg" && extension !== ".png") {
    return cb(new Error('Invalid file format'), false);
  }
  cb(null, true); // Accept the file if extension is valid
};

// Multer middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

// Error handling middleware for file upload
const fileMid = (err, req, res, next) => {
  if (err) {
    if (err.message === 'Invalid file format') {
      return res.render('addProduct', { message: 'Invalid file format. Please upload a .jpg or .png file.' });
    }
    return res.render('addProduct', { message: 'File upload error. Please try again.' });
  }
  next();
};

// Middleware to check if user is logged in (using cookies)
const mid = (req, res, next) => {
  if (req.cookies.token ) {
    return res.redirect("/");
  }
  next();
};

module.exports = {
  upload,
  fileMid,
  mid,
};
