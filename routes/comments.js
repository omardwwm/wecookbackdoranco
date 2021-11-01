const express = require('express');
const router = express.Router();
const Comment = require('../models/commentsModel');
const Recipe = require('../models/recipeModel');
const User = require('../models/users.model');
const auth = require('../middleware/auth');



router.post('/add/:recipeId/:userId', auth, async (req, res)=>{
    console.log(req.body);
    try {
        // const commentText = JSON.parse(req.body.commentContent); 
        const commentText = req.body.commentContent
        const {userId, recipeId} = req.params;
        console.log(req.params);
        const newComment = await new Comment({
            userId, recipeId, commentText
        });
        const savedNewComment = await newComment.save();
        const commentedRecipe = await Recipe.findById(req.params.recipeId);
        const userAuthor = await User.findById(req.params.userId);
        userAuthor.comments.unshift(savedNewComment);
        // console.log(commentedRecipe);
        commentedRecipe.comments.unshift(savedNewComment)
        
        await commentedRecipe.save();
        await userAuthor.save();
        return res.status(201).json({message: 'Comment successfully posted', savedNewComment})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

router.get('/allComments', auth, async(req, res)=>{
    try {
        const allComments = await Comment.find().populate([{path:'userId', select:'username'}]);
        return res.json(allComments)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})
// router.post('/add-comment/:id', auth, async (req, res)=>{
//     try {
//         const comment = req.body;
//         const commentedRecipe = await Recipe.findById(req.params.id);
//         console.log(req.params.id);
//         console.log('recipe is', commentedRecipe.comments);
//         commentedRecipe.comments.unshift(comment)
//         await commentedRecipe.save();
//     } catch (error) {
//         res.status(500).json({message: error.message})
//     }
// })

router.delete('/delete/:commentId', auth, async (req, res)=>{
    try {
        let commentId = req.params.commentId;
        const deletedComment = await Comment.findOneAndRemove({_id: commentId});
        await Recipe.updateOne({_id: deletedComment.recipeId}, {$pull:{comments:commentId}});
        await User.updateOne({_id:deletedComment.userId}, {$pull:{comments:commentId}})

    res.json({message:'Comment deleted succefully'});
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

module.exports = router;