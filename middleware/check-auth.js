const HttpError = require("../models/http-error");
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // to skip token check on option request 
    if(req.method === 'OPTIONS') {
        return next();
    }

    try {
        const token = req.headers.authorization; // in client side it set as Autherizaion: 'Bearer TOKEN'
        console.log(token);
        if(!token) {
            throw new Error('Authentication failed.')
        }

        // verify jwt token
        // const decodedToken = jwt.verify(token, 'supersectrete_dont_share');
        const decodedToken = jwt.verify(token, process.env.JWT_SECRETE_KEY);
        req.userData = {userId: decodedToken.userId};
        next();
    } catch (err) {
        const error =  new HttpError('Authentication failed', 403   );
        return next(error);
    }
    
}