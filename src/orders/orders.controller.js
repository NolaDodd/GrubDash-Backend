const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

//add handlers and middleware functions to create, read, update, delete, and list orders.
// TODO: Implement the /orders handlers needed to make the tests pass

function create(req, res) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}
  
function hasProperty(req, res, next) {
    const orderId = req.params.orderId;
    const foundOrder = orders.find((order) => order.id === orderId);
    const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } = req.body;

    if (!deliverTo || deliverTo === "") {
        return next({ status: 400, message: "Order must include a deliverTo" });
    } else if (!mobileNumber || mobileNumber === "") {
        return next({ status: 400, message: "Order must include a mobileNumber" });
    } else if (!dishes){
        return next({ status: 400, message: "Order must include a dish" });
    } else if (dishes.length === 0 || !Array.isArray(dishes)){
        return next({ status: 400, message: "Order must include at least one dish" });
    } 
    // Check each dish's quantity
    dishes.forEach((dish, index) => {
        if (!dish.quantity || dish.quantity <= 0 || !Number.isInteger(dish.quantity)) {
            return next({ status: 400, message: `Dish ${index} must have a quantity that is an integer greater than 0` });
        }
    });
    return next();
}

  function list(req, res) {
  const localOrder = res.locals.order
  if (localOrder){
    const orderId  = localOrder.id
    const orderIdSearch = orders.filter(orderId ? order => order.id == orderId : () => true)
    res.json({ data: orderIdSearch});
  } else {
     res.json({ data: orders });
  }
 }

function checkOrder(req, res, next){
    const { orderId } = req.params
    const foundOrder = orders.find((order) => order.id === orderId);
    const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    const validStatuses = ["pending", "preparing", "out-for-delivery", "delivered"];
  
    if (!deliverTo || deliverTo === "") {
        return next({ status: 400, message: "Order must include a deliverTo" });
    } else if (!mobileNumber || mobileNumber === "") {
        return next({ status: 400, message: "Order must include a mobileNumber" });
    } else if (!dishes){
        return next({ status: 400, message: "Order must include a dish" });
    } else if (dishes.length === 0 || !Array.isArray(dishes)){
        return next({ status: 400, message: "Order must include at least one dish" });
    } 
    dishes.forEach((dish, index) => {
      if (!dish.quantity || dish.quantity <= 0 || !Number.isInteger(dish.quantity)) {
         return next({ status: 400, message: `Dish ${index} must have a quantity that is an integer greater than 0` });
      }
    })    
  if (id && id !== orderId) {
    return next({ status: 400, message: `Order id does not match route id. Order: ${id}, Route: ${orderId}` })
    } else if (!status || !validStatuses.includes(status)){
        return next({ status: 400, message: `Order must have a status of pending, preparing, out-for-delivery, delivered` });
    } else if (status === "delivered"){
        return next({ status: 400, message: `A delivered order cannot be changed` });
    }
  return next()
}  
  function orderExists(req, res, next) {
    const orderId = req.params.orderId;
    const foundOrder = orders.find((order) => order.id === orderId);
    if (foundOrder) {
      res.locals.order = foundOrder
      return next();
    }
    next({ status: 404, message: `order id not found: ${orderId}`,
    });
  }

  
  function read(req, res) {
    res.json({ data: res.locals.order });
  }
  
  function update(req, res) {
    const localOrder = res.locals.order
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    delete req.body.id;

    localOrder.deliverTo = deliverTo
    localOrder.mobileNumber = mobileNumber
    localOrder.status = status
    localOrder.dishes = dishes
  
    res.json({ data: localOrder });
  }

  function notPending(req, res, next){
    const localOrder = res.locals.order
    const orderStatus = localOrder.status
    if (orderStatus !== "pending"){
     next({ status: 400, message: "An order cannot be deleted unless it is pending."
     })
    } else {
     return next()
    }
  }

  function destroy(req, res) {
    const { orderId } = req.params
    const index = orders.findIndex((order) => order.id === orderId);
    if (index > -1) {
      orders.splice(index, 1);
    }
    res.sendStatus(204);
  }
  
  module.exports = {
    list,
    create: [hasProperty, create],
    read: [orderExists, read],
    update: [orderExists, checkOrder, update],
    delete: [orderExists, notPending, destroy],
  };