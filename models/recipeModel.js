const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
    ingredientName: {
        type: String,
        trim: true
    },
    quantity: {
        type: String,
        trim: true
    },
    // added 01/11/2021 test  06/11/2021 10pm
    ingredientUnity: {
        type: String,
        trim: true
    }
});



const recipeSchema = new mongoose.Schema({
    recipeName: {
        type: String,
        required : true
    },
    recipeCreator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipeCreatorName: {
        type: mongoose.Schema.Types.Mixed,
        ref: 'User',
        required: true
    },
    recipeIngrediants:[ingredientSchema],

    recipeDescription: {
        type: Object,
        required: true
    },
    recipePicture:{
        type: String,
        required: true
    },
    recipePreparationTime: {
        type: String,
        required: true
    },
    recipeCookingTime: {
        type: String,
        required: true
    },
    recipeCategory: {
        type: String,
        required : true
    },
    creationDate:{
        type: Date,
        required: true,
        default: Date.now
    },
    comments:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
    }],
    likes:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
    // Added for nutrifacts 06/01/2022, at: 20:22
    ,
    recipeNutriFacts:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RecipeNutriFacts'
    }]
})

module.exports = Recipe = mongoose.model('Recipe', recipeSchema);
// module.exports = Comment = mongoose.model('Comment', commentSchema)