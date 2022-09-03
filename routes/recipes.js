const express = require('express');
require('dotenv').config();
const router = express.Router();
const auth = require('../middleware/auth');
const multer =  require('../middleware/multer-config');
const controllerRecipe = require('../controllers/RecipeController');
// let path = require('path');

// Get all recipes
router.get('/', controllerRecipe.getAllRecipes);

// Get recipes for homePage
router.get('/lastRecipes', controllerRecipe.getLastRecipes);

// Get one recipe
router.get('/:id', controllerRecipe.getOneRecipe);


// CREATE NEW RECIPE   LATER : ADD MORE CONTROLE (CHECK AND VALID ALL FIELDS ONE BY ONE!!!!!) //TODO
router.post('/add-recipe/', auth, multer.single('recipePicture'), controllerRecipe.createRecipe);

// Update recipe
router.put("/update/:id", auth, multer.single('recipePicture'), controllerRecipe.updateRecipe);

// Delete recipe
router.delete("/delete/:id", auth, controllerRecipe.deleteRecipe);

// Get recipe comments
router.get('/:id/getAllComments', auth, controllerRecipe.getAllRecipeComments);

// Make/put a "Like" to recipe
router.put('/like/:recipeId', auth, controllerRecipe.likeRecipe);

// Unlike recipe (retirer le 'Like')
router.put('/unlike/:recipeId', auth, controllerRecipe.unlikeRecipe);   


module.exports = router;