const router = require("express").Router();
const controller = require("./orders.controller");

// TODO: Implement the /orders routes needed to make the tests pass
router.route("/:orderId")
  .get(controller.read)
  .put(controller.update)
  .delete(controller.delete)
  .all(controller.notAllowed)
router.route("/")
  .get(controller.list)
  .post(controller.create)
  .all(controller.notAllowed)
module.exports = router;
