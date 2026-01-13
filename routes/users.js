const { Router } = require('express');
const {getUsers, getUserById, getCurrentUser, updateUserProfile, updateUserAvatar} = require('../controllers/users');
const { validateUserId, validateUpdateUser, validateUpdateAvatar } = require('../middlewares/validation');

const router = Router();

router.get('/', getUsers);
router.get('/me', getCurrentUser);
router.patch('/me', validateUpdateUser, updateUserProfile);
router.patch('/me/avatar', validateUpdateAvatar, updateUserAvatar);
router.get('/:userId', validateUserId, getUserById);


module.exports = router;
