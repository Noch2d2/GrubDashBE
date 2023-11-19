const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");
const methodNotAllowed = require("../errors/methodNotAllowed");

function checkExists(req, res, next){
  const dishId = req.params.dishId;
  const foundDish = dishes.find(dish => dish.id === dishId);
  if (foundDish){
    res.locals.foundDish = foundDish;
    return next()
  }
  next ({
    status:404,
    message: `Dish does not exist: ${dishId}`
  })
}

function list(req, res, next) {
  res
    .status(200)
    .json({data:dishes});
}

function validateCreateFields(req, res, next) {
  const data = req.body.data;
  if (!data.name || data.name === ''){
    return next({status: 400, message: 'Dish must include a name'});
  }
  if (!data.description || data.description === ''){
    return next({status: 400, message: 'Dish must include a description'});
  }

  if (!data.price || data.price === ''){
    return next({status: 400, message: 'Dish must include a price'});
  }

  if (data.price < 0){
    return next({status:400, message: 'Dish must have a price that is an integer greater than 0'})
  }

  if (!Number.isInteger(data.price)){
    return next( {status:400, message: 'Dish must have a price that is an integer greater than 0'} );
  }

  if (!data.image_url || data.image_url === ''){
    return next({status: 400, message: 'Dish must include an image_url'});
  }

  next();

}

function validateUpdateFields(req, res, next) {
  const foundData = res.locals.foundDish;
  const bodyData = req.body.data;

  if ((bodyData.id === undefined || bodyData.id === '' || bodyData.id === null) && foundData.id){
    return next();
  }

  if (bodyData.id !== foundData.id){
    return next({
      status:400,
      message:`Dish id does not match route id. Dish: ${bodyData.id}, Route: ${foundData.id}`
    })
  }
  next();
}

function createDish(req, res, next) {
  const data = req.body.data;
  data.id = nextId();
  dishes.push(data);
  res.status(201).json({data: data});
  next();
}

function getDish(req, res, next) {
  res.status(200)
  .json({data: res.locals.foundDish});
  next();
}

function updateDish(req, res, next) {
  const foundData = res.locals.foundDish;
  const updatedData = {...foundData, ...req.body.data, id:foundData.id};
  const dishIndex = dishes.findIndex(dish => dish.id === foundData.id);
  dishes[dishIndex] = updatedData;
  res.status(200).json({data: updatedData});
  next();
}

function deleteDish(req, res, next) {
  next()
}


function notAllowed(req, res, next) {
  return methodNotAllowed(req, res, next);
}


module.exports = {
  create:[validateCreateFields, createDish],
  read:[checkExists, getDish],
  update:[checkExists, validateCreateFields, validateUpdateFields, updateDish],
  delete:[deleteDish],
  list,
  notAllowed
}