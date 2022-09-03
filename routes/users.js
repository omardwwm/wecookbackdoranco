const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const controllerUser = require("../controllers/UserController")

// Get all users
router.get('/professionnals', controllerUser.getAllProfessionnal);

// Function to recuperate  user
router.get("/:id", auth, controllerUser.getOneUser);

// Get one users profil
router.get('/profile', auth, controllerUser.getUserProfile);

router.post('/register', multer.single("profilePicture"), controllerUser.createUser);

// Login function
router.post('/login', controllerUser.loginUser);

// Check if token is valid
router.post('/checkToken', controllerUser.checkUserToken);

//Update a user
router.patch('/update', auth, multer.single("profilePicture"), controllerUser.updateUser)

// Change password
router.put('/changePassword/:id', auth, controllerUser.changeUserPassword);

//  Change picture profile
router.put('/updatePicture/:id', auth, multer.single("profilePicture"), controllerUser.updateUserPicture);

// Add userMetaData
router.post('/metadata/add/:userId', auth, controllerUser.addUserMetaData);

// Update userNetaData
router.put('/metadata/update/:userId', auth, controllerUser.updateUserMetaData);

// Get userMetaData
router.get('/metadata/:userId', controllerUser.getUserMetaData); 

// Delete profile/user
router.delete("/delete/:id", auth, controllerUser.deleteUser);

module.exports = router