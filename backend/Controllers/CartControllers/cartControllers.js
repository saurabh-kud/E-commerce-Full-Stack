const asyncHandler = require("express-async-handler");
const cart = require("../../Models/CartModel/cartModel");
const products = require("../../Models/ProductsModel/productsModel");

const createCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.params.id;

  if (!productId || !quantity) {
    res.status(400);
    throw new Error("all field is required");
  }
  //checking userId in param and token is equal or not
  if (userId != req.user._id) {
    res.status(401);
    throw new Error("not Authorized");
  }

  try {
    //cheking product available or not in db
    const productAva = await products.findOne({ _id: productId });
    if (!productAva) {
      res.status(400);
      throw new Error("product doesn't exist");
    }

    const cartava = await cart.findOne({ userId });
    if (!cartava) {
      const carts = await cart.create({
        userId,
        items: [
          {
            productId,
            quantity,
          },
        ],
        totalItems: 1,
        totalPrice: productAva.price * quantity,
      });
      if (carts) {
        res.status(201).json({
          status: true,
          message: "cart created sucessfully",
          data: carts,
        });
      } else {
        res.status(400);
        throw new Error("something went wrong");
      }
    } else {
      let { items, totalItems, totalPrice } = cartava;
      totalPrice += productAva.price * quantity;
      totalItems += quantity;
      //we have to filter at the place of loop we do it tommarrow
      for (i in items) {
        if (items[i].productId.toString() === productId) {
          items[i].quantity += quantity;

          console.log(items, totalItems, totalPrice);
          const updatedcart = await cart.updateOne(
            { userId },
            { userId, items, totalItems, totalPrice },
            { new: true }
          );

          res.json({ msg: "working on it" });
        }
      }
      items.push({ productId, quantity });

      const updatedcart = await cart.updateOne(
        { userId },
        { userId, items, totalItems, totalPrice },
        { new: true }
      );
      console.log(items, totalItems, totalPrice);

      res.json({ msg: "working on it" });
    }
  } catch (error) {
    console.log(error.message);
    throw new Error(error.message);
  }
  //   res.json("create cart sucessfully");
});

const updateCart = asyncHandler(async (req, res) => {
  res.json("update cart sucessfully");
});

const getCart = asyncHandler(async (req, res) => {
  res.json("get cart sucessfully");
});

const deleteCart = asyncHandler(async (req, res) => {
  res.json("delete cart sucessfully");
});

module.exports = {
  createCart,
  updateCart,
  getCart,
  deleteCart,
};
