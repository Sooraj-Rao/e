import express from "express"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import Product from "../models/Product.js"
import Order from "../models/Order.js"
import { adminAuth } from "../middleware/auth.js"
import upload from "../middleware/upload.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

router.get("/", async (req, res) => {
  try {
    const { category, search, sort } = req.query
    const query = {}

    if (category && category !== "all") {
      query.category = category
    }

    if (search) {
      query.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }

    const sortOption = {}
    if (sort === "price-low") sortOption.price = 1
    else if (sort === "price-high") sortOption.price = -1
    else if (sort === "newest") sortOption.createdAt = -1
    else sortOption.createdAt = -1

    const products = await Product.find(query).sort(sortOption)
    res.json(products)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }
    res.json(product)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.post("/", adminAuth, upload.single("image"), async (req, res) => {
  try {
    const { title, description, price, category, stock } = req.body

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" })
    }

    const product = new Product({
      title,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
      image: req.file.filename,
    })

    await product.save()
    res.status(201).json(product)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.put("/:id", adminAuth, upload.single("image"), async (req, res) => {
  try {
    const { title, description, price, category, stock } = req.body

    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    const updateData = {
      title,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
    }

    if (req.file) {
      const oldImagePath = path.join(__dirname, "../public/products", product.image)
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath)
      }
      updateData.image = req.file.filename
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true })
    res.json(updatedProduct)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    const pendingOrders = await Order.find({
      "items.product": req.params.id,
      status: { $in: ["pending", "confirmed", "shipped"] },
    })

    if (pendingOrders.length > 0) {
      return res.status(400).json({
        message: `Cannot delete product. It has ${pendingOrders.length} pending order(s). Please wait until orders are delivered or cancel them first.`,
      })
    }

    const imagePath = path.join(__dirname, "../public/products", product.image)
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath)
    }

    await Product.findByIdAndDelete(req.params.id)
    

    res.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message })
  }
})

export default router
