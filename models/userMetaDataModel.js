const mongoose = require('mongoose');

const userMetaSchema = new mongoose.Schema({
    userPresentation:{
        type: String
    },

    userKitchenStyles:[{
        type: String,
        trim: true
    }],

    userEstablissement:{
        type: String
    },

    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
})

module.exports = UserMetaData = mongoose.model('UserMetaData', userMetaSchema)