const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  deleteUserDebug
} = require('../controllers/userController');

// routes mapping
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUserDebug);

module.exports = router;
