// routes/userRoutes.js
import express from 'express';
import { registerUser, loginUser } from '../controller/user.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { getBusiness, registerBusiness } from '../controller/busness.controller.js';
import { createInvoice, getInvoices } from '../controller/invoice.controller.js';
import { addProduct, deleteProduct, getProducts, updateProduct } from '../controller/product.controller.js';

const router = express.Router();

// Register route
router.post('/register', registerUser);

// Login route
router.post('/login', loginUser);
router.post('/businesses', authenticate, registerBusiness);
router.get("/businesses",authenticate,getBusiness)
router.post('/invoice', authenticate, createInvoice);
router.post('/add', authenticate,addProduct);
router.get("/getProduct",authenticate,getProducts)
router.patch("/updateProducts",authenticate,updateProduct)
router.delete("/deleteProdcts",authenticate,deleteProduct)
router.get("/invoice",authenticate,getInvoices)
router.get("/invoice/:id",authenticate,getInvoices)


export default router;