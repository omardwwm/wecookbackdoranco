const User = require('../models/users.model');
const Recipe = require('../models/recipeModel');
const RecipeNutriFacts = require('../models/nutriFactsModel');
const { s3Config, multerS3Config, checkFileType } = require('../s3');

exports.getAllRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find().populate('comments').populate({ path: 'recipeCreator', select: 'isPro' });
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.getLastRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find().sort({ _id: -1 }).limit(5);
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.getOneRecipe = async (req, res) => {
    // console.log(req);
    // TODO//ADD POPULATE RECIPENUTRIFACTS TO REQUEST (FOR RECIPEDETAILS IN FRONT TO DISPLAY NUTRIFACTS OF EACH RECIPE)
    try {
        const thisRecipe = await Recipe.findById(req.params.id).populate({
            path: 'comments',
            populate: ({
                path: 'userId', select: ['username', 'profilePicture']
            })
        }).populate('recipeNutriFacts');
        // console.log(thisRecipe); 
        res.json(thisRecipe);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
    // res.send(req.params.id)
}

exports.createRecipe = async (req, res) => {
    try {
        // const url = req.protocol + '://' + req.get('host');
        let { recipeName, recipeDescription, recipeCreator, recipeCreatorName, recipePreparationTime, recipeCookingTime, recipeCategory, nutriFactsStatus } = req.body;
        const ingrediants = req.body.recipeIngrediants;
        // To add recipeNutriFcts (Updated 09/01/2022 at 19h42) 
        const recipeNutriFacts = req.body.recipeNutriFacts;
        // console.log(JSON.parse(recipeCreator));
        const UserCreator = await User.findById(recipeCreator);
        // console.log(UserCreator);
        const recipeIngrediants = JSON.parse(ingrediants);
        // To add recipeNutriFcts (Updated 09/01/2022 at 19h42) 
        const nutriFactsFromReq = JSON.parse(recipeNutriFacts);
        // console.log(nutriFactsFromReq);
        let recipePicture;
        if (req.file) {
            // recipePicture =  "/public/uploads/" +  req.file.filename;
            recipePicture = req.file.location;
        }
        // console.log('multer3s is:', recipePicture);
        if (!recipeName || !recipeDescription || !recipeCreator || !recipeCreatorName || !recipeIngrediants || !recipePicture) {
            return res.status(400).json({ message: "Enter all fileds for recipe please !" })
        }
        const existingRecipe = await Recipe.findOne({ recipeName: recipeName });
        if (existingRecipe) {
            return res.status(400).json({ message: 'This recipe is already exists ! cook an other' });
        }
        const newRecipe = new Recipe({
            recipeName, recipeDescription, recipeCreator, recipeCreatorName, recipeIngrediants, recipePreparationTime, recipeCookingTime, recipeCategory,
            recipePicture, nutriFactsStatus
        });

        // To add recipeNutriFcts (Updated 09/01/2022 at 19h42) 
        // Ae;iorer, ajouter les vraies valeur recuperer ds la requettes via req.body avec les rest de la recette!!!!
        const nutriFacts = new RecipeNutriFacts({
            recipeClories: nutriFactsFromReq.recipeCaloriesIn100Grams, recipeCarbohydes: nutriFactsFromReq.recipeCarbohydIn100Grams, recipeProteines: nutriFactsFromReq.recipeProteinIn100Grams, recipeFat: nutriFactsFromReq.recipeFatIn100Grams, recipeFiber: nutriFactsFromReq.recipeFiberIn100Grams, recipeId: newRecipe._id
        });
        await nutriFacts.save();
        await newRecipe.recipeNutriFacts.unshift(nutriFacts);
        const savedNewRecipe = await newRecipe.save();
        await UserCreator.recipes.unshift(savedNewRecipe);
        await UserCreator.save();
        return res.status(201).json({ message: 'Recipe successfully added', savedNewRecipe })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.updateRecipe = async (req, res) => {
    // console.log("pictue sent", req.body.oldRecipePicture);
    // console.log('file is', req.file);
    // console.log(req.params.id);
    try {
        let { recipeName, recipeDescription, recipeCreator, recipeCreatorName, recipePreparationTime, recipeCookingTime, recipeCategory } = req.body;
        const ingrediants = req.body.recipeIngrediants;
        const recipeIngrediants = JSON.parse(ingrediants);
        // To add recipeNutriFcts (Updated 13/01/2022 at 20h07) 
        const recipeNutriFacts = req.body.recipeNutriFacts;
        const nutriFactsFromReq = JSON.parse(recipeNutriFacts);
        // console.log(recipeNutriFacts);
        let recipePicture;
        if (req.file) {
            // let newPicture =  "/public/uploads/" +  req.file.filename;
            let newPicture = req.file.location;
            recipePicture = newPicture
        } else {
            let oldPicture = req.body.oldRecipePicture;
            recipePicture = oldPicture;
            // console.log('old pict', recipePicture);
            // console.log(path.basename(oldPicture));
        }
        const updatedRecipe = await Recipe.findOneAndUpdate({ _id: req.params.id },
            {
                recipeName, recipeDescription, recipeCreator, recipeCreatorName, recipeIngrediants, recipePreparationTime, recipeCookingTime, recipeCategory,
                recipePicture
            }, { new: true, upsert: false }
            // {"$set": { "recipeNutriFacts.$.recipeClories": "900" }}
            // , { new:true, upsert: false},
        );

        const updatedNutriFacts = await RecipeNutriFacts.findOneAndUpdate({ recipeId: req.params.id }, { $set: { recipeClories: nutriFactsFromReq.recipeCaloriesIn100Grams, recipeCarbohydes: nutriFactsFromReq.recipeCarbohydIn100Grams, recipeProteines: nutriFactsFromReq.recipeProteinIn100Grams, recipeFat: nutriFactsFromReq.recipeFatIn100Grams, recipeFiber: nutriFactsFromReq.recipeFiberIn100Grams } }, { new: true });
        // console.log(path.basename(req.body.recipePicture))
        if (req.file) {
            let oldImageName = path.basename(req.body.oldRecipePicture)
            // console.log(oldImageName);
            s3Config.deleteObject({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: oldImageName
            }, (err, data) => {
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
        // res.json({message:'Recipe was updated', updatedRecipe});
        res.json({ message: 'Recipe was updated', updatedRecipe, updatedNutriFacts });
        console.log(updatedRecipe);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.deleteRecipe = async (req, res) => {
    // console.log('req befor try:', req.query.dataToDelete);
    // let imageName =  path.basename(req.body.data)
    // console.log('image befor try:', imageName)
    try {
        const deletedRecipe = await Recipe.deleteOne({ _id: req.params.id });
        let imageName = path.basename(JSON.parse(req.query.dataToDelete));
        let imageToDeleteFromAWS = path.basename(req.query.dataToDelete);
        // console.log('imageName', imageName);
        s3Config.deleteObject({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: imageToDeleteFromAWS
        }, (err, data) => {
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
        res.json({ message: 'Recipe test deleted', deletedRecipe });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.getAllRecipeComments = async (req, res) => {
    try {
        const allComents = await Recipe.findById(req.params.id).populate('comments');
        res.status(201).json(allComents);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.likeRecipe = async (req, res) => {
    try {
        let recipeId = req.params.recipeId;
        let userId = req.body.userId;
        // console.log(req.body)
        const thatRecipe = await Recipe.findById(recipeId);
        if (thatRecipe.likes.includes(userId)) {
            res.status(404).json({ message: 'DEJA LIKED PAR VOUS!' })
        } else {
            await Recipe.updateOne({ _id: recipeId }, { $push: { likes: userId } },
                { new: true }
            );
            res.status(201).json({ message: 'Recette liked' });
        }

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.unlikeRecipe = async (req, res) => {
    try {
        let recipeId = req.params.recipeId;
        let userId = req.body.userId;
        const thatRecipe = await Recipe.findById(recipeId);
        if (!thatRecipe.likes.includes(userId)) {
            res.status(404).json({ message: 'vous n\'avez pas liker pour pouvoir disliker!' })
        } else {
            await Recipe.updateOne({ _id: recipeId }, { $pull: { likes: userId } },
                { new: true }
            );
            res.status(201).json({ message: 'Recette disliked' });
        }

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}