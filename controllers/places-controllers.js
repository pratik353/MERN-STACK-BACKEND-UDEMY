const { validationResult } = require('express-validator');
const {v4 : uuidv4} = require('uuid');
const fs = require('fs');

const HttpError = require("../models/http-error");
const Places = require('../models/place');
const User = require('../models/user');
const getCoordsForAddress = require("../util/location");
const { default: mongoose } = require('mongoose');

let DUMMY_PLACES = [
    {
        id:'p1',
        title:'Empire State Building',
        description:'One of the most famouse sky scrapers in the world',
        imageUrl:'https://assets.simpleviewinc.com/simpleview/image/fetch/c_fill,h_334,q_75,w_579/https://assets.simpleviewinc.com/simpleview/image/upload/crm/newyorkstate/GettyImages-486334510_CC36FC20-0DCE-7408-77C72CD93ED4A476-cc36f9e70fc9b45_cc36fc73-07dd-b6b3-09b619cd4694393e.jpg',
        address:'Empire State Building 20 W 34th St., New York, NY 10001, United States',
        location:{
            lat:40.7484405,
            lng:-73.9856644
        },
        creator:'u1'
    },
    {
        id:'p4',
        title:'Empire State Building',
        description:'One of the most famouse sky scrapers in the world',
        imageUrl:'https://assets.simpleviewinc.com/simpleview/image/fetch/c_fill,h_334,q_75,w_579/https://assets.simpleviewinc.com/simpleview/image/upload/crm/newyorkstate/GettyImages-486334510_CC36FC20-0DCE-7408-77C72CD93ED4A476-cc36f9e70fc9b45_cc36fc73-07dd-b6b3-09b619cd4694393e.jpg',
        address:'Empire State Building 20 W 34th St., New York, NY 10001, United States',
        location:{
            lat:40.7484405,
            lng:-73.9856644
        },
        creator:'u1'
    },
    {
        id:'p2',
        title:'Empi. State Building',
        description:'One of the most famouse sky scrapers in the world',
        imageUrl:'https://assets.simpleviewinc.com/simpleview/image/fetch/c_fill,h_334,q_75,w_579/https://assets.simpleviewinc.com/simpleview/image/upload/crm/newyorkstate/GettyImages-486334510_CC36FC20-0DCE-7408-77C72CD93ED4A476-cc36f9e70fc9b45_cc36fc73-07dd-b6b3-09b619cd4694393e.jpg',
        address:'Empire State Building 20 W 34th St., New York, NY 10001, United States',
        location:{
            lat:40.7484405,
            lng:-73.9856644
        },
        creator:'u2'
    }
];

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid;

    // const place = DUMMY_PLACES.find( place => {
    //     return place.id === placeId
    // })

    let place;
    try {
        // findById(req.id) return id matches value
        place = await Places.findById(placeId).exec();
    } catch (err) {
        const error = new HttpError('Something went wrong, Could not find a place', 500);
        return next(error);
    }

    if(!place) {
        const error =  new HttpError('Could not find a place for the provided id', 404);
        return next(error);
    } 

    // cobverting mongoose object into javascript object and converting _id --> id by {getters: true}
    res.json({place: place.toObject({getters: true})});
}

// function getPlaceById() { .... }
// function getPlaceById = () => { .... }

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;

    // array.find() only return first element which matches
    // const place = DUMMY_PLACES.find( place => place.creator === userId );

    //array.filter() returns full array which matches our critaria
    // const places = DUMMY_PLACES.filter( place => place.creator === userId );

    // let places;
    let userWithPlaces;
    try {
        // find() return array bydefault
        // places = await Place.find({creator: userId}).exec();

        // .populate() goes to that provide args in ref value in schema
        userWithPlaces = await User.findById(userId).populate('places');
    } catch (err) {
        console.log(err);
        const error = new HttpError('Fetching places failed.', 500);
        return next(error);
    }

    // if(!places || places.length === 0){       
    //     return next(new HttpError('Could not find a place for the provided id.', 404))
    // }

    if(!userWithPlaces?.places || userWithPlaces?.places.length === 0){       
        return next(new HttpError('Could not find a place for the provided id.', 404))
    }

    // res.json({places});
    // res.json({places : places.map( place => place.toObject({getters: true}))});
    res.json({places : userWithPlaces.places.map( place => place.toObject({getters: true}))});
}

const createPlace = async (req, res, next) => {

    // validation result - express validation
    const errors = validationResult(req);

    // res.json({errors})
     if(!errors.isEmpty()){
        // in express throw not works correctally in async function
        return next(new HttpError('Invalid inputs passed, please check your data.', 422));
     }
    // access body send by user
    // const {title, description, coordinates, address, creator } = req.body;
    const {title, description, coordinates, address, creator } = req.body;
    console.log(creator);

    let coordinate;
    // use try-catch in async - await functions
    try{
        coordinate = await getCoordsForAddress(address);
    } catch(error){
        // next() == forwords error - use return to get return back wwhen we get error // next() automatically not stops code execution
        return next(error); 
    }

    // const createdPlace  = {
    //     // id:uuidv4(),
    //     title,
    //     description,
    //     location: coordinate,
    //     image:'https://assets.simpleviewinc.com/simpleview/image/fetch/c_fill,h_334,q_75,w_579/https://assets.simpleviewinc.com/simpleview/image/upload/crm/newyorkstate/GettyImages-486334510_CC36FC20-0DCE-7408-77C72CD93ED4A476-cc36f9e70fc9b45_cc36fc73-07dd-b6b3-09b619cd4694393e.jpg',
    //     address,
    //     creator
    // };

    const createdPlace = new Places({
        title,
        description,
        location: coordinate,
        image: req.file.path, // store only path of file in database
        address,
        creator: req.userData.userId
    });

    let user;
    try {
        // user = await User.findById(creator);
        user = await User.findById(req.userData.userId); // creatorId replaced by token returning id
    } catch (err) {
        const error = new HttpError('Creating place faild, please try again later', 500);
        return next(error);
    }

    console.log(user);
    if(!user){
        const error = new HttpError('We could not find user for provided Id', 404);
        return next(error);
    }

    try {
        // criating new mongoose session
        const session = await mongoose.startSession();

        // starting  transaction();
        session.startTransaction();
        await createdPlace.save( {session: session});
        // assigning place to specific user
        user.places.push(createdPlace);
        // updating user data 
        await user.save({ session: session});
        await session.commitTransaction();
    } catch (err) {
        const error = new HttpError('Creating place failed, please try again.', 404);
        return next(error);
    }

    // DUMMY_PLACES.push(createdPlace);
    // try {
    //     // await createdPlace.save();

    // } catch (err) {
    //     console.log(err);
    //     const error = new HttpError('Creating place faild, please try again later', 500)
    //     return next(error);
    // }

    res.status(201).json({place: createdPlace}); // 201 is used when we create any new data
}

const updatePlace = async (req, res, next) => {

    const errors = validationResult(req);

    // res.json({errors})
     if(!errors.isEmpty()){
        throw new HttpError('Invalid inputs passed, please crsheck your data.', 422);
     }

    const {title, description} = req.body;
    const placeId = req.params.pid;

    // create new object and copy old object in new array
    // const updatePlace = {...DUMMY_PLACES.find( p => p.id === placeId)};
    // const placeIndex = DUMMY_PLACES.findIndex( p => p.id === placeId);
    // updatePlace.title = title;
    // updatePlace.description = description;

    // DUMMY_PLACES[placeIndex] = updatePlace;

    let place;
    try {
        place = await Places.findById(placeId).exec();
    } catch (err) {
        const error = new HttpError('Something went wrong, Could not update a place', 500);
        return next(error);
    }

    // extracting token userId and comparing with place creator for update place authorization on backend
    if(place.creator.toString() !== req.userData.userId) {
        const error = new HttpError('You are not allowed to edit this place', 401);
        return next(error);
    }

    place.title = title;
    place.description = description;

    try {
        await place.save();
    } catch (err) {
        const error = new HttpError('Something went wrong, Could not update a place', 500);
        return next(error);
    }

    res.status(200).json({place: place.toObject({getters: true})});
};

const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;

    // if(!DUMMY_PLACES.find( p => p.id === placeId)){
    //     throw new HttpError('Could not find place with that id.', 404);
    // }

    // DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId);

    let place;
    try {
        // take also reference of creator in User schema
        place = await Places.findById(placeId).populate('creator');
    } catch (err) {
        const error = new HttpError('Something went wrong, Could not delete a place', 500);
        return next(error);
    }

    if(!place){
        const error = new HttpError('Could not find place for that id.', 500);
        return next(error);
    }

    // extracting token userId and comparing with place creator for update place authorization on backend
    if(place.creator.id !== req.userData.userId) {
        const error = new HttpError('You are not allowed to delete this place', 401);
        return next(error);
    }

    let imagePath = place.image;

    try {
        const session = await mongoose.startSession();
        session.startTransaction();
        await place.deleteOne( {session: session});
        // removing place from user 
        place.creator.places.pull(place);
        await place.creator.save({ session: session});
        await session.commitTransaction();
    } catch (err) {
        const error = new HttpError('Something went wrong, Could not delete a place', 500);
        return next(error);
    }

    // delete place image when place deleted 
    fs.unlink(imagePath, (err) => {
        console.log(err);
    });
    
    // try {
    //     // remove() => remove document from the collection -> this method is removed from latest mongoose version
    //     // instaed you can use deleteOne() method
    //     await place.deleteOne();
    // } catch (err) {
    //     const error = new HttpError('Something went wrong, Could not delete a place', 500);
    //     return next(error);
    // }

    res.status(200).json({message:'Place deleted successfully'})
};

// export mutiple things
exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;