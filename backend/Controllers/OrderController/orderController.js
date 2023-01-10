const asyncHandler = require("express-async-handler");
const cart = require("../../Models/CartModel/cartModel");
const user = require("../../Models/UsersModel/userModel");
const order = require("../../Models/OrderModel/orderModel");

const createOrder = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  // console.log(req.body);
  // const { status, cancellable } = req.body;

  // if (!status || !cancellable) {
  //   res.status(400);
  //   throw new Error("all is mandotory");
  // }
  // if (
  //   !status === "pending" ||
  //   !status === "completed" ||
  //   !status === "cancelled"
  // ) {
  //   res.status(400);
  //   throw new Error("status should be pending or completed or completed");
  // }
  //checking userId in param and token is equal or not
  if (userId != req.user._id) {
    res.status(401);
    throw new Error("not Authorized");
  }
  try {
    const isCartAvaible = await cart.findOne({ userId });

    if (!isCartAvaible || isCartAvaible.items.length <= 0) {
      res.status(404);
      throw new Error("cart doesn't exist");
    }
    const cartDetails = {
      userId,
      items: isCartAvaible.items,
      totalPrice: isCartAvaible.totalPrice,
      totalItems: isCartAvaible.totalItems,
      status: "pending",
      iscancellable: true,
    };

    const orderFromDb = await order.create(cartDetails);
    if (orderFromDb) {
      await cart.deleteOne({ userId });
      res.status(201);
      res.json({
        status: true,
        message: "order Placed sucessfully",
        data: orderFromDb,
      });
    } else {
      res.status(400);
      throw new Error("something went wrong");
    }
  } catch (error) {
    throw new Error(error.message);
  }
});

const updateOrder = asyncHandler(async (req, res) => {
  const { id: userId, orderid: orderId } = req.params;
  const { status } = req.body;
  if (!status) {
    res.status(401);
    throw new Error("all field is required");
  }
  if (userId != req.user._id) {
    res.status(401);
    throw new Error("not Authorized");
  }

  if (!req.user.isAdmin) {
    if (status !== "cancelled") {
      res.status(400);
      throw new Error("not permited to do this");
    }
  }
  try {
    if (!req.user.isAdmin) {
      var isOrderAvailable = await order.findOne({
        _id: orderId,
        cancellable: true,
        userId,
      });
    } else {
      isOrderAvailable = await order.findOne({
        _id: orderId,
        cancellable: true,
      });
    }

    if (isOrderAvailable) {
      const updatedOrder = {
        userId: isOrderAvailable.userId,
        _id: isOrderAvailable._id,
        items: isOrderAvailable.items,
        totalPrice: isOrderAvailable.totalPrice,
        totalItems: isOrderAvailable.totalItems,
        cancellable: isOrderAvailable.cancellable,
        status,
      };

      const isUpdated = await order.findByIdAndUpdate(
        { _id: orderId },
        updatedOrder,
        { new: true }
      );

      if (isUpdated) {
        res.status(200);
        res.json({
          status: true,
          message: "order Updated",
          data: isUpdated,
        });
      } else {
        res.status(400);
        throw new Error("something went wrong");
      }
    } else {
      res.status(400);
      throw new Error("order doesn't exist");
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const getOrder = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  if (userId != req.user._id) {
    res.status(401);
    throw new Error("not Authorized");
  }
  try {
    const isOrderAvailable = await order.find({ userId });
    if (isOrderAvailable.length > 0) {
      res.status(200);
      res.json({
        status: true,
        message: "order get sucessfully",
        data: isOrderAvailable,
      });
    } else {
      res.status(200);
      res.json({
        status: true,
        message: "you haven't placed any order",
        data: [],
      });
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});
const getSingleOrder = asyncHandler(async (req, res) => {
  const { id: userId, orderid: orderId } = req.params;
  if (userId != req.user._id) {
    res.status(401);
    throw new Error("not Authorized");
  }

  try {
    const isOrderAvailable = await order.findOne({ userId, _id: orderId });
    if (isOrderAvailable) {
      res.status(200);
      res.json({
        status: true,
        message: "order get sucessfully",
        data: isOrderAvailable,
      });
    } else {
      res.status(400);
      throw new Error("order doesn't exist");
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const deleteOrder = asyncHandler(async (req, res) => {
  const { id: userId, orderid: orderId } = req.params;
  if (userId != req.user._id) {
    res.status(401);
    throw new Error("not Authorized");
  }
  try {
    const isOrderAvailable = await order.findOne({ _id: orderId });
    if (isOrderAvailable) {
      const isDeleted = await order.findByIdAndDelete({ _id: orderId });

      if (isDeleted) {
        res.status(200);
        res.json({
          status: true,
          message: "order deleted",
          data: isDeleted,
        });
      } else {
        res.status(400);
        throw new Error("something went wrong");
      }
    } else {
      res.status(400);
      throw new Error("order doesn't exist");
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = {
  createOrder,
  updateOrder,
  getOrder,
  getSingleOrder,
  deleteOrder,
};
