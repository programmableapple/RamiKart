// orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/ordersController');
const verifyToken = require('../middleware/authMiddleware'); // Fixed import
// const verifyToken = require('../middleware/ordersMiddleware').verifyToken;
const isAdmin = require('../middleware/ordersMiddleware').isAdmin;
const verifyOrderAccess = require('../middleware/ordersMiddleware').verifyOrderAccess;
const validateOrderData = require('../middleware/ordersMiddleware').validateOrderData;
const validateOrderStatusUpdate = require('../middleware/ordersMiddleware').validateOrderStatusUpdate;
const canCancelOrder = require('../middleware/ordersMiddleware').canCancelOrder;

// Create a new order
router.post('/', verifyToken, validateOrderData, orderController.createOrder);

// Get user's orders
router.get('/user', verifyToken, orderController.getUserOrders);

// Get a specific order
router.get('/:id', verifyToken, verifyOrderAccess, orderController.getOrderById);

// Update order status (admin only)
router.patch('/:id/status', verifyToken, verifyOrderAccess, isAdmin, validateOrderStatusUpdate, orderController.updateOrderStatus);

// Cancel order
router.patch('/:id/cancel', verifyToken, verifyOrderAccess, canCancelOrder, orderController.cancelOrder);

// Delete order
router.delete('/:id', verifyToken, verifyOrderAccess, orderController.deleteOrder);

// Cancel an order
router.post('/:id/cancel', verifyToken, verifyOrderAccess, canCancelOrder, orderController.cancelOrder);

module.exports = router;