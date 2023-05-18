const {v4 : uuidv4} = require('uuid');
const HttpError = require("../models/http-error");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { validationResult } = require('express-validator');
const User = require('../models/user');

let DUMMY_USERS = [
    {
        id:'u1',
        name:'Max Schwarz',
        email: 'test@test.com',
        password: 'testers'
    }
];

const getUsers = async (req, res, next) => {
    // res.status(200).json(DUMMY_USERS);

    // exclude password in returning dacument
    // const users = User.find({}, '-password');
    
    let users;
    try {
        // include email, image and name in returning dacument
        users = await User.find({}, 'email name image places');
    } catch (err) {
        const error = new HttpError('Fetching users failed, please try again later', 500);
        return next(error);
    }

    res.json({users: users.map( user => user.toObject({getters: true}))});
};

const signup = async (req, res, next) => {
    const errors = validationResult(req);
    // res.json({errors})
     if(!errors.isEmpty()){
        const error= new HttpError('Invalid inputs passed, please check your data.', 422);
        return next(error);
    }

    const { username, email, password } = req.body;

    // const hasUser = DUMMY_USERS.find( u => u.email === email);
    // if(hasUser){
    //     // status code 422 used for invalid user input
    //     throw new HttpError('Could not create user, email already exist. ',422);
    // }

    let existingUser;
    try {
        existingUser = await User.findOne({email: email})
    } catch (err) {
        const error = new HttpError('Signin up failed, Please truy again later.', 500);
        return next(error);
    }

    if(existingUser) {
        const error = new HttpError('User exist already with this email, please login instead.', 500);
        return next(error);
    }

    let hashedPassword;
    try {
        // hashing password 
        // bcrypt.hash('password value', encrypt_password_character_length) -> 
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        const error = new HttpError('Could not create user, please try again.', 500);
        return next(error);
    }

   const createdUser = new User({
    name: username,
    email,
    password: hashedPassword,
    image: req.file.path, // req.file.path - it is multer property and it give access to req contained file path
    places: []
   });

   try {
       await createdUser.save();
   } catch (err) {
    const error = new HttpError('Signup failed, Please try again later.', 500);
    return next(error);
   }

   let token;
   try {
        // creating jwt token
        // jwt.sign() -> 1st arg = object which want to inclued in token
        //               2nd arg = private key which only server knows - token validation
        //               3rd arg = expiry time of token (optional)
        
        // token = jwt.sign({ userId: createdUser.id, email: createdUser.email }, 'supersectrete_dont_share', {expiresIn: '1h'})
        token = jwt.sign({ userId: createdUser.id, email: createdUser.email }, process.env.JWT_SECRETE_KEY, {expiresIn: '1h'})
   } catch (err) {
        const error = new HttpError('Signup failed, Please try again later.', 500);
        return next(error);
   }

    // DUMMY_USERS.push(createdUser);

   res.status(201).json({message: 'User created successfully.' ,userId: createdUser.id, email: createdUser.email, token: token });
};

const login = async (req, res, next) => {
   const {email, password} = req.body;

//    const identifiedUser = DUMMY_USERS.find( user => user.email === email);

//    if( !identifiedUser || identifiedUser.password !== password){
//         // 401 status code == authentication failed
//         throw new HttpError(' Could not identify user, credentials seem to be wrong.', 401) 
//    }

let existingUser;
    try {
        existingUser = await User.findOne({email: email})
    } catch (err) {
        const error = new HttpError('Loging in failed, Please try again later.', 500);
        return next(error);
    }

    if(!existingUser) {
        const error = new HttpError('Invalid credentials, could not login.', 401);
        return next(error);
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password)
    } catch (err) {
        const error = new HttpError('Could not log you in, please check your credentials and try again.', 500);
        return next(error);
    }

    if (!isValidPassword) {
        const error = new HttpError('Invalid credentials, could not login.', 401);
        return next(error);
    }

    let token;
    try {
        token = jwt.sign({ userId: existingUser.id, email: existingUser.email }, 'supersectrete_dont_share', {expiresIn: '1h'})
    } catch (err) {
         const error = new HttpError('Logging in failed, Please try again later.', 500);
         return next(error);
    }

    res.status(200).json({message: 'user logged in.', userId: existingUser.id, email: existingUser.email, token: token});
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;