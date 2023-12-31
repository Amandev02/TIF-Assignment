const {Router} = require('express');
const authController = require('../controllers/authController');

const router = Router();


router.post('/signin', authController.signin_post);
router.post('/signup', authController.signup_post);
router.get('/me',authController.me_get);

module.exports = router;