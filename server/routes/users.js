import express from "express";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { adminAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", adminAuth, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", adminAuth, async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userOrders = await Order.find({ user: req.params.id }).populate(
      "items.product"
    );

    for (const order of userOrders) {
      if (order.status !== "delivered" && order.status !== "cancelled") {
        for (const item of order.items) {
          if (item.product) {
            const product = await Product.findById(item.product._id);
            if (product) {
              product.stock += item.quantity;
              await product.save();
            }
          }
        }

        order.status = "cancelled";
        order.cancelledAt = new Date();
        order.cancelledBy = "admin";
        order.cancellationReason = "User account deleted";
        await order.save();
      }
    }

    await Promise.all([
      User.findByIdAndDelete(req.params.id),
      Order.deleteMany({ user: req.params.id }),
    ]);

    res.json({
      message: `User deleted successfully. ${
        userOrders.filter((o) => o.status !== "delivered").length
      } orders were cancelled and stock restored.`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
