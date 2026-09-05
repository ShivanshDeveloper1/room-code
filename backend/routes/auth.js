const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const upload = require('../middleware/multerConfig');

// user register
router.post('/register', authController.registerUser);

// admin registration (optional - protected with ADMIN_CREATION_SECRET)
router.post('/register-admin', authController.registerAdmin);

// login (for both admin and user)
router.post('/login', authController.login);

module.exports = router;
