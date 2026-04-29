// controllers/product.controller.js
import Product from '../model/product.model.js';

// Save product for a business
export const addProduct = async (req, res) => {
  try {
     const userId = req.user.id; 
    const {hsCode, itemName, taxRate, uom } = req.body;
   

    // Create product
    const product = await Product.create({
      hsCode,
      userId,
      itemName,
      taxRate,
      uom
    });

    res.status(201).json({ message: 'Product added successfully', product });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


export const getProducts = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all products where userId matches the logged-in user
    const products = await Product.findAll({
      where: { userId }
    });

    res.status(200).json({ 
      success: true, 
      count: products.length, 
      products 
    });

  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.body;
    const userId = req.user.id;

    const deleted = await Product.destroy({
      where: { id, userId }
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Product not found or unauthorized' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });

  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.body; // The product ID from the URL
    const userId = req.user.id;
    const updateData = req.body;

    // Find the product and ensure it belongs to the user
    const product = await Product.findOne({ where: { id, userId } });

    if (!product) {
      return res.status(404).json({ message: 'Product not found or unauthorized' });
    }

    // Update the product fields
    await product.update(updateData);

    res.status(200).json({ message: 'Product updated successfully', product });

  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};