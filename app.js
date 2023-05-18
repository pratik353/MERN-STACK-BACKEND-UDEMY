const fs = require('fs')
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');

// const DB_URL = 'mongodb+srv://mernstack-course:pratik123@cluster0.5j4t3vg.mongodb.net/mern_udemy?retryWrites=true&w=majority';
const DB_URL = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.5j4t3vg.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const placesRouter = require('./routes/places-route');
const usersRouter = require('./routes/users-route');
const HttpError = require('./models/http-error');

const app = express();

// object to JSON parser middleware
app.use(bodyParser.json());

// express.static(path.join('uploads', 'images')) --> return static files which are pointed in path.join();
app.use('/uploads/images', express.static(path.join('uploads', 'images')));

// cors middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next();
});

app.use('/api/places', placesRouter); // => /api/places/...

app.use('/api/users', usersRouter);

// this middleware only runs when routes not found
app.use((req, res, next) => {
    const error = new HttpError('Could not find this route.', 404);
    throw error;
});

// ERROR HANDLING MIDDLEWARE 
app.use((error, req, res, next) => {
    // multer property -> to file undo when error occures  
    if(req.file) {
        // fs.unlink() --> delete file if any error occured in that request with other parameters
        fs.unlink(req.file.path, (err) => {
            console.log(err);
        });
    };
    // if response header already sent
    if(res.headerSent){
        next(error);
    }

    // if status code present OR set default code 500 = something went wrong
    res.status(error.code || 500);
    res.json({message: error.message || 'An unknown error occured!'})

});

mongoose.connect(DB_URL).then(()=>{
    console.log('Connection established');
    app.listen(process.env.PORT || 5000);
}).catch((err) => {
    console.log('Could not connnected to database');
});


 