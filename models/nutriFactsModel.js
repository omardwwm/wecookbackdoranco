const mongoose = require('mongoose');

const nutriFactsSchema = new mongoose.Schema({

    recipeClories:{
        type:Number
    },

    recipeCarbohydes:{
        type:Number
    },

    recipeProteines:{
        type:Number
    },

    recipeFat:{
        type:Number
    },

    recipeId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Recipe'
    }
});

module.exports = RecipeNutriFacts = mongoose.model('RecipeNutriFacts', nutriFactsSchema);