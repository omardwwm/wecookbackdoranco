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
    // added 01/11/2021 test  06/11/2021 10pm update in test-branch
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
})

module.exports = Recipe = mongoose.model('Recipe', recipeSchema);
// module.exports = Comment = mongoose.model('Comment', commentSchema)