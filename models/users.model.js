const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required : true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required : true,
        minlength: 6
    },
    profilePicture:{
        type: String
    },
    roles: {
        type: [{
            type: String,
            enum: ['ROLE_USER', 'ROLE_ADMIN']
        }],
        default: ['ROLE_USER']
    },

    isPro:{
        type:Boolean,
        required: true,
        default: false
    },

    recipes:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe'
    }],

    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    userMetaData:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserMetaData'
    },

    inscriptionDate:{
        type: Date,
        required: true,
        default: Date.now
    }
})


module.exports = User = mongoose.model('User', userSchema)