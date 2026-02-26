const crypto = require("crypto");
const Idempotency = require("../models/idempotency");

const generateHash = (body) => {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(body))
    .digest("hex");
};

const idempotencyMiddleware = async (req, res, next) => {
  const key = req.headers["idempotency-key"];

  if (!key) {
    return res.status(400).json({ message: "Idempotency-Key header required" });
  }

  const requestHash = generateHash(req.body);

  try {
    const record = await Idempotency.findOneAndUpdate(
      { key },
      {
        $setOnInsert: {
          key,
          requestHash,
          status: "processing"
        }
      },
      { new: true, upsert: true }
    );

    if (record.status === "completed") {
      if (record.requestHash !== requestHash) {
        return res.status(400).json({
          message: "Idempotency key reused with different data"
        });
      }

      return res.status(record.statusCode).json(record.response);
    }
 //race condition
    if (record.status === "processing" && record.requestHash !== requestHash) {
      return res.status(400).json({
        message: "Idempotency key reused with different data"
      });
    }

    const originalJson = res.json.bind(res);

    res.json = async (body) => {
      await Idempotency.findOneAndUpdate(
        { key },
        {
          status: "completed",
          response: body,
          statusCode: res.statusCode
        }
      );

      return originalJson(body);
    };

    next();

  } catch (err) {
    next(err);
  }
};

module.exports = idempotencyMiddleware;