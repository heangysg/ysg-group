const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

// Admin API Info
router.get('/', (req, res) => {
  res.json({ message: "YSG Admin API Base - Use sub-routes for actions." });
});

// Auth
router.post('/login', authController.login);
router.get('/create-admin', authController.createAdmin);

// Users
router.get('/users', userController.getAllUsers);
router.patch('/users', userController.updateUser);

module.exports = router;
