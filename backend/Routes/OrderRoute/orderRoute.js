const {
  createOrder,
  updateOrder,
  getOrder,
  deleteOrder,
  getSingleOrder,
} = require("../../Controllers/OrderController/orderController");
const {
  authAdmin,
  auth,
} = require("../../Middlewares/AuthMiddleware/authMiddleware");

const router = require("express").Router();

router.post("/:id/order", auth, createOrder);
router.put("/:id/order/:orderid", auth, updateOrder);
router.get("/:id/order", auth, getOrder);
router.get("/:id/order/:orderid", auth, getSingleOrder);
router.delete("/:id/order/:orderid", authAdmin, deleteOrder);

module.exports = router;
