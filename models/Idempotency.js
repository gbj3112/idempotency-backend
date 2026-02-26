const mongoose = require("mongoose");

const idempotencySchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  requestHash: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["processing", "completed"],
    required: true
  },
  response: {
    type: Object
  },
  statusCode: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // 24 hours TTL
  }
});

module.exports = mongoose.model("Idempotency", idempotencySchema);