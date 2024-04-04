const path = require("path");
// add handlers and middleware functions to create, read, update, and list dishes. 
// Note that dishes cannot be deleted

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function hasProperty(req, res, next) {
    const { data: { name, description, price, image_url } = {} } = req.body;
  
    if (!name || name === "") {
        return next({ status: 400, message: "Dish must include a name" });
    } else if (!description || description === "") {
        return next({ status: 400, message: "Dish must include a description" });
    } else if (!price){
        return next({ status: 400, message: "Dish must include a price" });
    } else if (price < 0 || !Number.isInteger(price)){
        return next({ status: 400, message: "Dish must have a price that is an integer greater than 0" });
    } else if (!image_url || image_url === ""){
        return next({ status: 400, message: `Dish must include a image_url` });
  }    
  return next();
}

function hasId(req, res, next){
    const {data: {id}} = req.body
    const {dishId} = req.params
    if (!dishId) {
        return next({ status: 400, message: `Dish does not exist: ${dishId}` });
    } else if (id && id !== dishId){
        return next({ status: 400, message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}` });
    }
    return next();
}

function create(req, res) {
    const { data: { name, description, price, image_url } = {} } = req.body;
    const newDish = {
      id: nextId(),
      name,
      description,
      price,
      image_url,
    };
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
  }

function read(req, res, next) {
  res.json({ data: res.locals.dish });
}; 

function list(req, res) {
 const localDish = res.locals.dish
    if (localDish){
        const dishId  = localDish.id
        const dishIdSearch = dishes.filter(dishId ? dish => dish.dishId == dishId : () => true)
        res.json({ data: dishIdSearch});
    } else {
        res.json({ data: dishes });
    }
}

function update(req, res) {
    const localDish = res.locals.dish
    const { data: { name, description, price, image_url } = {} } = req.body;
  
    localDish.name = name
    localDish.description = description
    localDish.price = price
    localDish.image_url = image_url
  
    res.json({ data: localDish });
  }


function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find(dish => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `dish id not found: ${dishId}`,
  });
};

module.exports = {
  list,
  update: [dishExists, hasId, hasProperty, update],
  read: [dishExists, read],
  create: [hasProperty, create]
};


