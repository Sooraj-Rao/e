import express from "express";
import jwt from "jsonwebtoken";
import OtpModel from "../models/Otp.js";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";
import nodemailer from "nodemailer";

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'bhavithkumarbc@gmail.com',        
    pass: 'tkkgsboclrchxrpu' 
    // user: process.env.EMAIL_USER,        
    // pass: process.env.EMAIL_APP_PASSWORD 
  }
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}`
    });

    await OtpModel.create({ name, email, password, otp });

    res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message });
  }
});


router.post('/otp', async (req, res) => {
  const { otp } = req.body;

  try {
    const record = await OtpModel.findOne({ otp });
    if (!record) return res.status(400).json({ message: 'Invalid or expired OTP' });

    const { name, email, password } = record;


    const user = new User({ name, email, password });
    await user.save();

    await OtpModel.deleteOne({ _id: record._id });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    res.status(200).json({
      message: 'Registration complete',
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/me", auth, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    },
  });
});

export default router;
