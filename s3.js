require('dotenv').config();
const AWS = require('aws-sdk');
const fs = require('fs');
const multerS3 = require('multer-s3');

const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_KEY

const s3Config = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    Bucket: process.env.AWS_BUCKET_NAME,
    region: process.env.AWS_BUCKET_REGION
  });

exports.s3Config = s3Config;

const checkFileType = (file, cb)=>{
    // extension autorisee
    const fileTypes = /jpeg|jpg|png|jfif|gif|webp/;
    // verfifier l'exte
    const extname = fileTypes.test(path.parse(file.originalname).ext);
    // verfier le mime
    const mimetype = fileTypes.test(file.mimeType);

    if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb("Error: type du fichier invalide !");
      }
}

exports.checkFileType = checkFileType;

const multerS3Config = multerS3({
    s3: s3Config,
    acl: 'public-read',
    bucket: process.env.AWS_BUCKET_NAME,
    metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname }); 
    },
    key: function (req, file, cb) {
        console.log('3S is:', file)
        cb(null, Date.now() + '-' + file.originalname)
    },
});

exports.multerS3Config = multerS3Config;