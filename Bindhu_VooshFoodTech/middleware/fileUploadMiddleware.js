const multer = require("multer");

const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const imageDir = 'images';
if (!fs.existsSync(imageDir)){
    fs.mkdirSync(imageDir);
}
const imageStorage = multer.diskStorage({
 
  destination: (req, file, cb) => {
    cb(null, 'images');
   
},
filename: (req, file, cb) => {
    cb(null, uuidv4() + '-' + file.originalname);
},
});
const fileFilter = (req, file, cb) => {
  console.log(file.mimetype, "mime type ");
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const errorHandle = async (req, res, next) => {
  
  if (!req.file) {
    return res.status(400).json({ message: "Invalid file format" });
  }

  next();
};
const fileUpload = multer({ storage:imageStorage,fileFilter: fileFilter }).single("photo");
module.exports = {  errorHandle, fileUpload };
