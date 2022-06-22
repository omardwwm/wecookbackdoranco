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
function checkFileTypes(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(
    path.extname(file.originalname).toString()
  );
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}

// Init upload 
const upload = multer({
  storage: multerS3Config,
  fileFilter: function (req, file, cb) {
    checkFileTypes(file, cb);
  },
}).single("profilePicture");

module.exports = upload; 