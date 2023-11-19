const router = require("express").Router();
const controller = require("./dishes.controller");
// TODO: Implement the /dishes routes needed to make the tests pass

router.route("/:dishId")
  .get(controller.read)
  .put(controller.update)
  .delete(controller.delete)
  .all(controller.notAllowed);

router.route("/")
  .post(controller.create)
  .get(controller.list)
  .all(controller.notAllowed);
module.exports = router;
