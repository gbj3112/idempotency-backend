const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  product: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

module.exports = mongoose.model("Order", orderSchema);