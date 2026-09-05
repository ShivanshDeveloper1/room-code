const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/multerConfig');

// get profile
router.get('/me', protect, userController.getProfile);

// get all users for chat
router.get('/all', protect, userController.getAllUsers);

// get user profile by ID
router.get('/profile/:userId', protect, userController.getUserProfile);

// update profile with avatar upload
router.put('/me', protect, upload.single('avatar'), userController.updateProfile);

// migration endpoint to add gender field
router.post('/migrate-gender', protect, userController.migrateGenderField);

module.exports = router;
