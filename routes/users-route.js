const express = require('express');

const { check } = require('express-validator');

const usersControllers = require('../controllers/users-controllers')

const fileUpload = require('../middleware/file-upload');
const router = express.Router();
 
router.get('/', usersControllers.getUsers);

// normalizeEmail() --> convert Test@test.com => test@test.com
// multer.single() --> accepts the only single file with image key
router.post('/signup',fileUpload.single('image'),[check('username').not().isEmpty(), check('email').normalizeEmail().isEmail(), check('password').isLength({min:6})], usersControllers.signup);

router.post('/login', usersControllers.login);

module.exports = router;