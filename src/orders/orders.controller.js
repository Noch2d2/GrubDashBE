const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));


// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

function list(req, res, next) {
  res
    .status(200)
    .json({data:orders});
}

function checkExists(req,res,next){
  const orderId = req.params.orderId;
  const foundOrder = orders.find(order => order.id === orderId);
  if(foundOrder){
    res.locals.foundOrder = foundOrder;
    next();
  }else{
    next({
      status: 404,
      message: `Order id not found: ${orderId}`
    });
  }
}

function getOrder(req,res,next){
  res
    .status(200)
    .json({data:res.locals.foundOrder});
  next();
}

function updateOrder(req,res,next){
  const orderId = res.locals.foundOrder.id;
  const updatedOrder = {...res.locals.foundOrder, ...req.body.data, id:orderId};
  orders[orders.findIndex(order => order.id === orderId)] = updatedOrder;
  res
    .status(200)
    .json({data: updatedOrder});
  next();
}

function validateCreateFields(req, res, next){
  const data = req.body.data;
  if (!data.deliverTo || data.deliverTo === ''){
    return next({status: 400, message: 'A deliverTo field is required'});
  }

  if (!data.mobileNumber || data.mobileNumber === ''){
    return next({status: 400, message: 'A mobileNumber field is required'});
  }

  if (!data.dishes){
    return next({status: 400, message: 'An dishes array is required'});
  }

  if (!(data.dishes instanceof Array)){
    return next({status: 400, message: 'An dishes array is required'});
  }

  if(data.dishes.length === 0){
    return next({status: 400, message: 'An dishes array with at least one item is required'});
  } else {
    if (!data.dishes.every(dish => dish.quantity !== undefined )) {
      return next({status: 400, message: 'Each dish must have a quantity of at least 1'});
    }
    if (!data.dishes.every(dish => dish.quantity > 0)) {
      return next({status: 400, message: 'One of the dishes has a quantity of 0'});
    }
    const foundNonIntegerDishQuantity = data.dishes.findIndex(dish => ! Number.isInteger(dish.quantity));
    if (foundNonIntegerDishQuantity > -1) {
      return next({status: 400, message: `The dish at index ${foundNonIntegerDishQuantity} has a non-integer quantity`});
    }
  }
  next();
}

function validateUpdateFields(req, res, next) {
  const foundData = res.locals.foundOrder;
  const bodyData = req.body.data;
  if ((bodyData.id === undefined || bodyData.id === '' || bodyData.id === null ) && foundData.id){
    return next();
  }

  if (foundData.id !== bodyData.id){
    return next({status: 400, message: `Order id in body: ${bodyData.id} does not match order id in URL: ${foundData.id}`});
  }

  if (bodyData.status === undefined){
    return next({status: 400, message: `Required field missing: status `});
  }

  if (!['pending', 'preparing', 'out-for-delivery', 'delivered'].includes(bodyData.status)) {
    return next({status: 400, message: `Value for status must be one of: pending, preparing, out-for-delivery, delivered`});
  }
  next();
}

function createOrder(req,res,next){
  const newOrder = {
    id: nextId(),
    deliverTo : req.body.data.deliverTo,
    mobileNumber : req.body.data.mobileNumber,
    dishes : req.body.data.dishes
  };
  orders.push(newOrder);
  res
    .status(201)
    .json({data:newOrder})
}

function deleteOrder(req,res,next){
  if (res.locals.foundOrder.status !== "pending"){
    return next({
      status:400,
      message:"Orders can't be deleted if not pending"
    });
  }
  const foundIndex = orders.findIndex((order)=> res.locals.foundOrder.id === order.id)
  orders.splice(foundIndex,1);
  res.sendStatus(204);
}

function notAllowed(req,res,next){
  next();
}

// TODO: Implement the /orders handlers needed to make the tests pass
module.exports = {
  list,
  read:[checkExists, getOrder],
  update:[checkExists, validateUpdateFields, validateCreateFields, updateOrder],
  create: [validateCreateFields,createOrder],
  delete: [checkExists, deleteOrder],
  notAllowed
}