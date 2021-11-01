const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/users.model');
const moment = require("moment");
const nodemailer = require('nodemailer');
smtpTransport = require('nodemailer-smtp-transport');
moment().format();

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_ADRESSE,
        pass: process.env.EMAIL_CONFIG
    }
});

const sendEmail = (emailTemplate) => {
    transporter.sendMail(emailTemplate, (err, info) => {
        if (err) {
        res.status(500).json("Error sending email")
        console.log(err)
        }else{
        console.log(`Email sent 🌻`, info && info.response)
        }           
    })
    }

router.post('/send-url/:email', async(req, res)=>{
    
    try {
        const { email } = req.params
        let user;
        user = await User.findOne({ email })
        if(!user){
            return res.status(400).json({message:`Aucun utilisateur avec cet email: ${email} es trouve`})
        }

        // res.json(user)
        // const token = crypto.randomBytes(16).toString("hex");
        const token = jwt.sign({email: email, _id:user._id}, process.env.JWT_SECRET, {algorithm: "HS256",expiresIn:'2h'});
        // console.log(token);

        const urlResetExires = moment().add(2, "hours");
        // console.log(urlResetExires);

        // const transporter = nodemailer.createTransport({

        // })
        

        const url = `https://wecook.netlify.app/reset-password/${user._id}/${token}`;
        // console.log(user);
        const emailTemplate = {
            from: "wecook@noReply.com",
            to: user.email,
            subject: "🌻 Reset du mot de passe 🌻",
            html: `
                <p>Bonjour ${user.username},</p>
                <p>Vous avez oublie votre mot de passe et vous avez demande de le renitialiser! Vous pouvez lefaire en suivant ce lien:</p>
                <a href=${url}>${url}</a>
                <p>ce lien s'expire dans deux heures.</p>
                `
                // return { from, to, subject, html }
        }
        const test = jwt.decode(token);
        // console.log('decodedTokenIs', test)
        
            sendEmail(emailTemplate);
            return res.status(201).json({message:`Un email vous a ete envoye \a' ${email}, suivez les instruction pourreset votre mot de passe`})
        // }
        // if(user){
        // }
        // else{
        //    return res.status(400).json({message:`Aucun utilisateur avec cet email: ${email} es trouve`})
        // }  
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
})

router.put('/change-password/:userId/:token', async(req, res)=>{
    try {
        const { userId, token } = req.params;
        let {newPassword, newPasswordConfirm} =req.body;
        // console.log(req.params);
        console.log(req.body);
        const user = await User.findOne({_id: userId })
        const secret = user.password 
        const payload = jwt.decode(token, secret);
        const userIdFromDB = user._id;
        const userIdFromParams = payload._id;
        console.log(userIdFromDB);
        console.log(userIdFromParams);
        console.log(newPassword);
        console.log(newPasswordConfirm);
        if(userIdFromDB == userIdFromParams){
            if(newPassword !== newPasswordConfirm){
                return res.status(400).json({message: 'Mots de passes doivent etres identiques'})
            }
            const hashedPassword = bcrypt.hashSync(newPassword, 10)
            const updatedUserWithNewPassword = await User.findByIdAndUpdate({_id:userId},{
                $set :{password:hashedPassword}}, {new:true})
            
                const emailTemplate = {
                    from: "wecook@noReply.com",
                    to: user.email,
                    subject: "🌻 Reset du mot de passe 🌻",
                    html: `
                        <p>Bonjour ${user.username},</p>
                        <p>Votre mot de passe a ete renitialise!</p>
                        `
                } 
                
            sendEmail(emailTemplate);
            res.json({message:"mot de passe a ete changee"})
        }
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})



module.exports = router