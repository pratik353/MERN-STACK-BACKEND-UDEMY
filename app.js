const express = require('express');
const bodyParser = require('body-parser');

const placesRouter = require('./routes/places-route');

const app = express();

app.use('/api/places', placesRouter); // => /api/places/...

// ERROR HANDLING MIDDLEWARE 
app.use((error, req, res, next) => {
    // if response header already sent
    if(res.headerSent){
        next(error);
    }

    // if status code present OR set default code 500 = something went wrong
    res.status(error.code || 500);
    res.json({message: error.message || 'An unknown error occured!'})

});

app.listen(5000);
 