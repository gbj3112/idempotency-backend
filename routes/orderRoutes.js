const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const idempotencyMiddleware = require("../middlewares/idempotency");

router.post("/", idempotencyMiddleware, async (req, res, next) => {
  try {
    const order = new Order(req.body);
    const savedOrder = await order.save();

    res.status(201).json({
      success: true,
      data: savedOrder
    });

  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    res.json(order);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;