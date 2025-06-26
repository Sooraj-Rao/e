import express from "express"
import jwt from "jsonwebtoken"

const router = express.Router()

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
      return res.status(400).json({ message: "Invalid admin credentials" })
    }

    const adminUser = {
      id: "admin",
      name: "Administrator",
      email: process.env.ADMIN_EMAIL,
      role: "admin",
    }

    const token = jwt.sign({ userId: "admin", role: "admin" }, process.env.JWT_SECRET)

    res.json({
      token,
      user: adminUser,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.get("/me", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ message: "No token provided" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" })
    }

    const adminUser = {
      id: "admin",
      name: "Administrator",
      email: process.env.ADMIN_EMAIL,
      role: "admin",
    }

    res.json({ user: adminUser })
  } catch (error) {
    res.status(401).json({ message: "Invalid token" })
  }
})

export default router
