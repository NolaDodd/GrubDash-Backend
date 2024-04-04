// TODO: Implement the /orders routes needed to make the tests pass

//  add two routes: /orders, and /orders/:orderId and attach the handlers 
// (create, read, update, delete, and list) exported from src/orders/orders.controller.js.
const router = require("express").Router();
const controller = require("./orders.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

router.route("/:orderId")
  .get(controller.read)
  .post(controller.create)
  .put(controller.update)
  .delete(controller.delete)
  .all(methodNotAllowed)

router.route("/")
  .get(controller.list)
  .post(controller.create)
  .all(methodNotAllowed)

module.exports = router;
