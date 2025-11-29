// const express = require('express');
// const router = express.Router();

// const {
//   registerUser,
//   loginUser,
//   getUsers,
//   getUserById,
//   updateUser,
//   deleteUser,
//   deleteUserDebug
// } = require('../controllers/userController');

// // routes mapping
// router.post('/register', registerUser);
// router.post('/login', loginUser);
// router.get('/', getUsers);
// router.get('/:id', getUserById);
// router.put('/:id', updateUser);
// router.delete('/:id', deleteUserDebug);

// module.exports = router;

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id/debug', userController.deleteUserDebug); // debug version

module.exports = router;
