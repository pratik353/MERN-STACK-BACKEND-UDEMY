const express = require('express');

// obejct destructure
const { check } = require('express-validator');
const checkAuth = require('../middleware/check-auth');

const placesController = require('../controllers/places-controllers');
const fileUpload = require('../middleware/file-upload');

// const HttpError = require('../models/http-error');

const router = express.Router();

// const DUMMY_PLACES = [
//     {
//         id:'p1',
//         title:'Empire State Building',
//         description:'One of the most famouse sky scrapers in the world',
//         imageUrl:'https://assets.simpleviewinc.com/simpleview/image/fetch/c_fill,h_334,q_75,w_579/https://assets.simpleviewinc.com/simpleview/image/upload/crm/newyorkstate/GettyImages-486334510_CC36FC20-0DCE-7408-77C72CD93ED4A476-cc36f9e70fc9b45_cc36fc73-07dd-b6b3-09b619cd4694393e.jpg',
//         address:'Empire State Building 20 W 34th St., New York, NY 10001, United States',
//         location:{
//             lat:40.7484405,
//             lng:-73.9856644
//         },
//         creator:'u1'
//     },
//     {
//         id:'p2',
//         title:'Empi. State Building',
//         description:'One of the most famouse sky scrapers in the world',
//         imageUrl:'https://assets.simpleviewinc.com/simpleview/image/fetch/c_fill,h_334,q_75,w_579/https://assets.simpleviewinc.com/simpleview/image/upload/crm/newyorkstate/GettyImages-486334510_CC36FC20-0DCE-7408-77C72CD93ED4A476-cc36f9e70fc9b45_cc36fc73-07dd-b6b3-09b619cd4694393e.jpg',
//         address:'Empire State Building 20 W 34th St., New York, NY 10001, United States',
//         location:{
//             lat:40.7484405,
//             lng:-73.9856644
//         },
//         creator:'u2'
//     }
// ];
 
// GET REQUEST with PARAMS
router.get('/:pid', placesController.getPlaceById);


// USING CONTROLLER FUNCTION INSTEAD OF WRITING CODE HERE
// (req, res, next)=>{
//     const placeId = req.params.pid // {placeId : 'p1' }
//     const place = DUMMY_PLACES.find( place => {
//         return place.id === placeId
//     })

//     // sending 404 status code 
//     if(!place) {
//         // if we are in asynchronus function use = next(error) method;
//         // next(error);

//         // if we are in synchronus function use = throw error method;
//         // const error = new Error('Could not find a place for the provided id.');
//         // error.code = 404; 
//         // throw error;  // through cancels next execution

//         // using HttpError Class
//         throw new HttpError('Could not find a place for the provided id', 404);

//         //OR
//         // return next(error); // forword to next error middleware in app.js

//         // OR
//         // You can return error with status code
//         // return res.status(404).json({message:'Could not find a place for the provided id.'})
//     } 

//     res.json({place}); // => {place} => {place: place}
// });

router.get('/user/:uid', placesController.getPlacesByUserId);

// REPLACED BY CONTROLLER FUNCTION
// (req, res, next) => {
//     const userId = req.params.uid;
//     const place = DUMMY_PLACES.find( place => place.creator === userId );
//     if(!place){
//         // const error = new Error('Could not find a place for the provided id.');
//         // error.code = 404;
//         // return next(error)

//         // using HttpError Class
//         return next(new HttpError('Could not find a place for the provided id.', 404))
//     }
//     res.json({place});
// })

// token validation check middleware
router.use(checkAuth);

// POST API router
// validator middleware for input valus check / validation
router.post('/', fileUpload.single('image'), [check('title').not().isEmpty(), check('description').isLength({min: 5}), check('address').not().isEmpty()], placesController.createPlace);

// PATCH API route
router.patch('/:pid',[check('title').not().isEmpty(), check('description').isLength({min:5})], placesController.updatePlace);

// DELETE API route
router.delete('/:pid', placesController.deletePlace);

// exports single thing
module.exports = router;