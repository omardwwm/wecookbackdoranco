const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // required : true
    },
    recipeId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe'
    },
    commentText:{
        type: String,
        // required: true
    }, 

    postedAt:{
        type: Date,
        required: true,
        default: Date.now
    }
    
}) 

module.exports = Comment = mongoose.model('Comment', commentSchema)