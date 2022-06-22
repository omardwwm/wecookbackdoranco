const User = require('../models/users.model');
const UserMetaData = require('../models/userMetaDataModel');
const fs = require('fs')
let path = require('path');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
// const auth = require('../middleware/auth');
// const multer = require('multer');
const { s3Config, multerS3Config, checkFileType } = require('../s3');

// Get all users
exports.getAllProfessionnal = async (req, res) => {
    try {
        const users = await User.find().or([{ isPro: true }]).populate('recipes');
        const currentUser = await User.findById(req.user);
        res.json(users)
        // console.log(currentUser);
        // if(currentUser.roles === "ROLE_ADMIN" || currentUser.roles.includes("ROLE_ADMIN")){
        //     return res.json(users)
        // }else{
        //     return res.json({message: 'Not access to this content'})
        // }
        // res.json(currentUser);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
};
// Function to recuperate  user
exports.getOneUser = async (req, res) => {

    try {
        const myUser = await (await User.findById(req.params.id)).populate('recipes')
        if (myUser == null) {
            return res.status(404).json({ message: 'This user not existe' })
        } else {
            return res.json(myUser)
        }
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }

    //  next();
};

// Get one users profil
exports.getUserProfile = async (req, res) => {
    const user = await User.findById(req.user);
    // console.log(user);
    res.json({
        username: user.username,
        profilePicture: user.profilePicture,
        id: user._id,
        recipes: user.recipes
    });
    // res.send(res.myUser)
};

// Create user (register)
exports.createUser = async (req, res) => {
    // console.log('body in server side', req.body);
    try {
        let { username, email, password, passwordConfirm, roles, isPro } = req.body;
        // Validation form req
        if (!username || !email || !password || !passwordConfirm || !isPro) {
            return res.status(400).json({ message: 'All fileds must be entred Mr Omar !' });
        }
        if (passwordConfirm.length < 6) {
            return res.status(400).json({ message: 'Password must be au minimum 6 characteres' });
        }
        if (password !== passwordConfirm) {
            return res.status(400).json({ message: 'Password and passwordConfirm must be identiques' })
        }
        // const url = req.protocol + '://' + req.get('host');
        // console.log("Req profile file ---", req.file);
        let profilePicture = req.file && req.file.location;
        // console.log(profilePicture);
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ message: 'Utilisateur avec cet email existe deja 🌻' });
        }
        const hashedPassword = bcrypt.hashSync(req.body.password, 10)
        const newUser = new User({
            username, email, password: hashedPassword, profilePicture, isPro
        });
        const savedNewUser = await newUser.save();
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { algorithm: "HS256", expiresIn: '1d' });
        return res.status(201).json({ message: 'Utilisateur successfully created 🌻', savedNewUser, token })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        // Validation 
        if (!email || !password) {
            return res.status(400).json({ message: 'You must enter all fields Mr Omar' })
        }
        const myUser = await User.findOne({ email: email });
        if (!myUser) {
            return res.status(400).json({ message: 'User with this email not exists' });
        }
        const ispasswordMatch = await bcrypt.compare(password, myUser.password);
        if (!ispasswordMatch) {
            return res.status(400).json({ message: 'Invalide credentials (email ou mot de passe incorrects!!)' });
        }
        const token = jwt.sign({ id: myUser._id }, process.env.JWT_SECRET, { algorithm: "HS256", expiresIn: '1d' });
        res.json({
            token,
            user: {
                id: myUser._id,
                username: myUser.username,
                email: myUser.email,
                profilePicture: myUser.profilePicture,
                recipes: myUser.recipes,
            },
            message: "VOUS ETES CONNECTED 🌻🌻🌻"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.checkUserToken = async (req, res) => {
    try {
        const token = req.header("x-auth-token");
        if (!token) {
            return res.json(false)
        };
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        if (!verified) {
            return res.json(false)
        };
        const myUser = await User.findById(verified.id);
        if (!myUser) {
            return res.json(false)
        };
        return res.json(true);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        let { username, email, password, passwordConfirm, role } = req.body;
        const url = req.protocol + '://' + req.get('host');
        // console.log("Req profile file ---", req.file);
        let profilePicture = url + "/public/picturesProfile/" + req.file.filename;
        // console.log(profilePicture);
        const updatedUser = await User.findByIdAndUpdate(req.user, {
            username: username,
            email: email,
            role: role,
            profilePicture: profilePicture,
        },
            {
                new: true
            }
        );
        res.json({ updatedUser, message: 'User updated success' });
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
};

exports.changeUserPassword = async (req, res) => {
    // console.log(req.params); 
    // console.log(req.body); 
    try {
        let { newPassword, newPasswordConfirm } = req.body;
        let userId = req.params.id;
        if (newPassword !== newPasswordConfirm) {
            return res.status(400).json({ message: 'Password and passwordConfirm must be same' })
        }
        const hashedPassword = bcrypt.hashSync(newPassword, 10)
        const updatedUserWithNewPassword = await User.findByIdAndUpdate({ _id: userId }, {
            $set: { password: hashedPassword }
        }, { new: true })
        res.json({ updatedUserWithNewPassword, message: "mot de passe a ete changee" })

    } catch (error) {
        res.status(400).json({ message: error.message })
    }
};

exports.updateUserPicture = async (req, res) => {
    // console.log('file is:', req.file);
    // console.log('body is:', req.body);
    // console.log('params are:', req.params);  
    try {
        // const url = req.protocol + '://' + req.get('host');
        let userId = req.params.id;
        let newProfilePicture;
        if (req.file) {
            let receivedNewPic = req.file.location;
            newProfilePicture = receivedNewPic;
        } else {
            let receivedOldPic = req.body.oldProfilePicture;
            newProfilePicture = receivedOldPic;
        }
        const updatedUser = await User.findByIdAndUpdate({ _id: userId }, {
            $set: { profilePicture: newProfilePicture }
        }, { new: true })

        if (req.file) {
            let oldImageName = path.basename(req.body.oldProfilePicture)
            // let oldImage2 = path.basename(JSON.parse(req.body.oldProfilePicture))
            // console.log('old name picture', oldImageName);
            // console.log('parsedImg', oldImage2);
            s3Config.deleteObject({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: oldImageName
            }, (err, data) => {
                console.error(err);
                console.log('data delete is', data);
            }
            );
            // fs.unlink(path.join(__dirname, "../public/picturesProfile", oldImageName), (err)=>{
            //     if (err) {
            //         console.error(err); 
            //         return;
            //       }else {
            //         console.log('successfully deleted  old profile picture');                              
            //     }
            // })   
        }
        res.json({ updatedUser, message: req.file ? "photo de profil mise a jour" : "vous avez garder la mm image" });
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
};

exports.addUserMetaData = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { userPresentation, userKitchenStyles, userEstablissement } = req.body;
        // const userKitchenStylesReq = req.body.userKitchenStyles;
        // const userKitchenStyles = JSON.parse(userKitchenStylesReq);
        const userMetaData = await new UserMetaData({
            userId, userPresentation, userKitchenStyles, userEstablissement
        });
        await userMetaData.save();
        const user = await User.findByIdAndUpdate({ _id: userId }, { $push: { "userMetaData": userMetaData } }, function (err, model) { console.log(err); });
        res.status(201).json({
            message: 'userData succeffully added', userMetaData, user
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
};

exports.updateUserMetaData = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { userPresentation, userKitchenStyles, userEstablissement } = req.body;
        const updatedUserMetaData = await UserMetaData.findOneAndUpdate({ userId: userId }, {
            $set: {
                userPresentation: userPresentation,
                userKitchenStyles: userKitchenStyles,
                userEstablissement: userEstablissement
            }
        }, { new: true }
        );
        res.status(201).json({ message: 'Infos succeffully updated', updatedUserMetaData });

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
};

exports.getUserMetaData = async (req, res) => {
    try {
        const userId = req.params.userId;
        const userData = await User.findById(userId).populate('userMetaData').populate('recipes');
        // const metaData = user.userMetaData;
        // TODO // Trier les infos a envoyer, seulement celle necessaire pour l'affichage
        res.status(201).json(userData);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
};

exports.deleteUser = async (req, res) => {
    // console.log("are", req.params);
    // console.log('all Req is', req.body)
    try {
        let profilePicToDelete = path.basename(req.body.myCurrentProfilePicture)
        const deletedUser = await User.deleteOne({ _id: req.params.id });
        s3Config.deleteObject({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: profilePicToDelete
        }, (err, data) => {
            console.error(err);
            console.log('data delete is', data);
        }
        );
        // fs.unlink(path.join(__dirname, "../public/picturesProfile", profilePicToDelete), (err)=>{
        //     if (err) {
        //         console.error(err); 
        //         return;
        //     }else {
        //         console.log('successfully deleted profile picture of deleted account');                              
        //     }
        // })   
        res.json({ message: 'utilisateur deleted avec success' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};