const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    recipeNote:{
        type: Number,
        required: true
    }
})
