const express = require('express');
require('dotenv').config();
const router = express.Router();
const Recipe = require('../models/recipeModel');
const User = require('../models/users.model');
const auth = require('../middleware/auth');
const fs = require('fs');
const multer = require('multer');
// const upload = multer({dest: 'uploads/'});
const {s3Config, multerS3Config} = require('../s3');
let path = require('path');

// Get all recipes
router.get('/',  async (req, res)=>{
    try{
        const recipes = await Recipe.find().populate('comments').populate({path:'recipeCreator', select:'isPro'});
        res.json(recipes);
    } catch (error){
        res.status(500).json({message: error.message})
    }
})  

// Get recipes for homePage
router.get('/lastRecipes', async(req, res)=>{
    try{
        const recipes = await Recipe.find().sort({ _id: -1 }).limit(5);
        res.json(recipes);
    } catch (error){
        res.status(500).json({message: error.message})
    }
})

// Get one recipe
router.get('/:id',async (req, res)=>{
    // console.log(req);
    try {
        const thisRecipe = await Recipe.findById(req.params.id).populate({
            path:'comments',
            populate:({
                path: 'userId', select:['username', 'profilePicture']
            })
        });
        // console.log(thisRecipe); 
        res.json(thisRecipe);
    } catch (error) {
        res.status(500).json({message: error.message}) 
    }
    // res.send(req.params.id)
})

// Create/Add/Post a recipe to database
// const storage = multer.diskStorage({
//     destination: (req, file, callback)=>{
//         callback(null, "./public/uploads/"); 
//     },
//     filename: (req, file, callback)=>{
//         callback(null, file.fieldname + '-' + Date.now() +'-'+ file.originalname);
//     }
// })
//
// const s3Config = new AWS.S3({
//     accessKeyId: process.env.AWS_ACCESS_KEY,
//     secretAccessKey: process.env.AWS_SECRET_KEY,
//     Bucket: process.env.AWS_BUCKET_NAME,
//     acl: 'public-read'
//   });
//
// const multerS3Config = multerS3({
//     s3: s3Config,
//     bucket: process.env.AWS_BUCKET_NAME,
//     metadata: function (req, file, cb) {
//         cb(null, { fieldName: file.fieldname });
//     },
//     key: function (req, file, cb) {
//         console.log('3S is:', file)
//         cb(null, Date.now() + '-' + file.originalname)
//     }
// });

// const upload = multer({storage: storage})
const upload = multer({storage: multerS3Config})
 
router.post('/add-recipe/', auth, upload.single('recipePicture'),async(req, res)=>{
    try {
        // const url = req.protocol + '://' + req.get('host');
        let {recipeName, recipeDescription, recipeCreator, recipeCreatorName, recipePreparationTime, recipeCookingTime, recipeCategory} = req.body;
        const ingrediants = req.body.recipeIngrediants;
        // console.log(JSON.parse(recipeCreator));
        const UserCreator = await User.findById(recipeCreator);
        // console.log(UserCreator);
        const recipeIngrediants = JSON.parse(ingrediants);
        let recipePicture;
        if(req.file){
            // recipePicture =  "/public/uploads/" +  req.file.filename;
            recipePicture = req.file.location;
        }
        // console.log('multer3s is:', recipePicture);
        if(!recipeName || !recipeDescription || !recipeCreator || !recipeCreatorName || !recipeIngrediants || !recipePicture){
            return res.status(400).json({message: "Enter all fileds for recipe please !"})
        }
        const existingRecipe = await Recipe.findOne({recipeName: recipeName});
        if(existingRecipe){
            return res.status(400).json({message: 'This recipe is already exists ! cook an other'});
        }
        const newRecipe = new Recipe ({
            recipeName, recipeDescription, recipeCreator, recipeCreatorName, recipeIngrediants, recipePreparationTime, recipeCookingTime, recipeCategory,
            recipePicture
        });
        const savedNewRecipe = await newRecipe.save();
        await UserCreator.recipes.unshift(savedNewRecipe);
        await UserCreator.save();
        return res.status(201).json({message: 'Recipe successfully added', savedNewRecipe})
        
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

router.put("/update/:id", auth, upload.single('recipePicture'), async (req, res) => {
    // console.log("pictue sent", req.body.oldRecipePicture);
    // console.log('file is', req.file);
    // console.log(req.params.id);
    try {
        let {recipeName, recipeDescription, recipeCreator, recipeCreatorName, recipePreparationTime, recipeCookingTime, recipeCategory} = req.body;
        const ingrediants = req.body.recipeIngrediants;
        const recipeIngrediants = JSON.parse(ingrediants);
        let recipePicture;
        if(req.file){
            // let newPicture =  "/public/uploads/" +  req.file.filename;
            let newPicture =  req.file.location;
            recipePicture = newPicture
        }else{
            let oldPicture = req.body.oldRecipePicture;
            recipePicture = oldPicture;
            // console.log('old pict', recipePicture);
            // console.log(path.basename(oldPicture));
        }
    const updatedRecipe = await Recipe.findByIdAndUpdate({_id: req.params.id}, 
        { recipeName, recipeDescription, recipeCreator, recipeCreatorName, recipeIngrediants, recipePreparationTime, recipeCookingTime, recipeCategory,
            recipePicture}, {new: true}
    );
    // console.log(path.basename(req.body.recipePicture))
    if(req.file){
        let oldImageName =  path.basename(req.body.oldRecipePicture)
        // console.log(oldImageName);
        s3Config.deleteObject({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: oldImageName
            }, (err, data)=>{
                console.error(err);
                console.log('data delete is', data); 
            }
        );
        // fs.unlink(path.join(__dirname, "../public/uploads", oldImageName), (err)=>{
        //     if (err) {
        //         console.error(err);
        //         return;
        //       }else {
        //         console.log('successfully deleted  old image');                              
        //     }
        // })
    }
    res.json({message:'Recipe was updated', updatedRecipe});
    } catch (error) {
        res.status(500).json({message: error.message})
    }
    });

router.delete("/delete/:id", auth, async (req, res) => {
    // console.log('req befor try:', req.query.dataToDelete);
    // let imageName =  path.basename(req.body.data)
    // console.log('image befor try:', imageName)
    try {
    const deletedRecipe = await Recipe.deleteOne({_id: req.params.id});
    let imageName =  path.basename(JSON.parse(req.query.dataToDelete))
    // console.log('imageName', imageName);
    s3Config.deleteObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: imageName
        }, (err, data)=>{
            console.error(err);
            console.log('data delete is', data); 
        }
    );
    // let imageName =  path.basename(JSON.parse(req.query.dataToDelete))
    // console.log(imageName); 
    // fs.unlink(path.join(__dirname, "../public/uploads", imageName), (err)=>{
    //     if (err) {
    //         console.error(err);
    //         return;
    //       }else {
    //         console.log('successfully deleted local recipe image');                               
    //     }
    // })
    res.json({message:'Recipe test deleted', deletedRecipe});
    } catch (error) {
        res.status(500).json({message: error.message})
    }
    });

router.get('/:id/getAllComments', auth, async (req, res)=>{
    try {
        const allComents = await Recipe.findById(req.params.id).populate('comments');
        res.status(201).json(allComents);
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

router.put('/like/:recipeId', auth, async(req, res)=>{
    try {
        let recipeId = req.params.recipeId;
        let userId = req.body.userId;
        // console.log(req.body)
        const thatRecipe = await Recipe.findById(recipeId);
        if(thatRecipe.likes.includes(userId)){
            res.status(404).json({message:'DEJA LIKED PAR VOUS!'})
        }else{
            await Recipe.updateOne({_id: recipeId}, {$push:{likes:userId}},
            {new:true}
            );
            res.status(201).json({message:'Recette liked'});
        }
        
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

router.put('/unlike/:recipeId', auth, async(req, res)=>{
    try {
        let recipeId = req.params.recipeId;
        let userId = req.body.userId;
        const thatRecipe = await Recipe.findById(recipeId);
        if(!thatRecipe.likes.includes(userId)){
            res.status(404).json({message:'vous n\'avez pas liker pour pouvoir disliker!'})
        }else{
            await Recipe.updateOne({_id: recipeId}, {$pull:{likes:userId}},
            {new:true}
            );
            res.status(201).json({message:'Recette disliked'});
        }
        
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})
// router.post('/add-comment/:recipeId', auth, async (req, res)=>{
//     try {
//         const {commentAuthor, recipe, commentText} = req.body;
//         const newComment = await new Comment({
//             commentAuthor, recipe, commentText
//         });
//         const savedNewComment = await newComment.save();
//         const commentedRecipe = await Recipe.findById(req.params.recipeId);
//         console.log(commentedRecipe);
//         commentedRecipe.comments.unshift(savedNewComment)
        
//         await commentedRecipe.save();
//         return res.status(201).json({message: 'Comment successfully posted', savedNewComment})
//     } catch (error) {
//         res.status(500).json({message: error.message})
//     }
// })    


module.exports = router;