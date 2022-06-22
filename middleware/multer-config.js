const multer = require("multer");
const path = require("path");
const { s3Config, multerS3Config, checkFileType } = require("../s3")

// Set the Storage Engine
// const storage = multer.diskStorage({
//   destination: "./uploads",
//   filename: function (req, file, cb) {
//     cb(
//       null,
//       path.parse(file.originalname).name +
//       "-" +
//       Date.now() +
//       path.parse(file.originalname).ext
//     );
//   },
// });

// function checkFileType(file, cb) {
//   // extension autirse
//   const fileTypes = /jpeg|jpg|png/;
//   // verfifier l'exte
//   const extname = fileTypes.test(path.parse(file.originalname).ext);
//   // verfier le mime
//   const mimetype = fileTypes.test(file.mimeType);

//   if (mimetype && extname) {
//     return cb(null, true);
//   } else {
//     cb("Error: type du fichier invalide !");
//   }

// }

// Init upload
const upload = multer({
  storage: multerS3Config,
  // fileFilter: function (req, file, cb){
  //   checkFileType(file, cb);
  // },
}).single("profilePicture");
// const upload = multer({
//   storage: storage,
//   limits:1024,
//   fileFilter:function (rer, file, cb){
//       checkFileType(file, cb)
//   }
// }).single("photo-server");

module.exports = upload;