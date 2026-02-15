// ordersMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Order = require("../models/Order");
const logger = require("../controllers/logger");

/**
 * Middleware to verify if user is authenticated
 */
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ success: false, message: "Access token required" });

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.id).select("-passwordHash");

    if (!user) return res.status(403).json({ success: false, message: "Invalid token" });

    req.user = user;
    next();
  } catch (err) {
    logger.error(`Token verification error: ${err.message}`);
    return res.status(403).json({ success: false, message: "Token is not valid", error: err.message });
  }
};

/**
 * Middleware to verify if user can access a specific order
 */
const verifyOrderAccess = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Check if the user is the buyer or an admin
    if (order.buyer.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Access denied. You don't have permission to access this order" });
    }

    // Add order to request object for further use
    req.order = order;
    next();
  } catch (error) {
    logger.error(`Error verifying order access: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

/**
 * Middleware to verify if user is an admin
 */
const isAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required"
      });
    }
    next();
  } catch (error) {
    logger.error(`Admin verification error: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

/**
 * Middleware to validate order data
 */
const validateOrderData = (req, res, next) => {
  try {
    const { items, paymentInfo, shippingAddress } = req.body;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item.'
      });
    }

    // Check each item has product ID and quantity
    for (const item of items) {
      if (!item.product || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Each item must have a valid product ID and quantity.'
        });
      }
    }

    // Validate payment info
    if (!paymentInfo || !paymentInfo.method) {
      return res.status(400).json({
        success: false,
        message: 'Payment information is required.'
      });
    }

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city ||
      !shippingAddress.zip || !shippingAddress.country) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address is required.'
      });
    }

    next();
  } catch (error) {
    logger.error(`Order data validation error: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

/**
 * Middleware to validate order status updates
 */
const validateOrderStatusUpdate = (req, res, next) => {
  try {
    const { status } = req.body;

    // Define valid order statuses
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Order status is required.'
      });
    }

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Status must be one of: ${validStatuses.join(', ')}.`
      });
    }

    // Additional validations for specific status transitions
    if (req.order) {
      const currentStatus = req.order.status;

      // Prevent changing delivered orders
      if (currentStatus === 'delivered' && status !== 'delivered') {
        return res.status(400).json({
          success: false,
          message: 'Cannot change status of delivered orders.'
        });
      }

      // Prevent changing cancelled orders
      if (currentStatus === 'cancelled' && status !== 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Cannot change status of cancelled orders.'
        });
      }
    }

    next();
  } catch (error) {
    logger.error(`Order status validation error: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

/**
 * Middleware to check if order can be cancelled
 */
const canCancelOrder = async (req, res, next) => {
  try {
    const order = req.order;

    // Orders can only be cancelled if they are pending or processing
    if (order.status !== 'pending' && order.status !== 'processing') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel orders that are already ${order.status}.`
      });
    }

    // Check if user is either the buyer or an admin
    if (order.buyer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to cancel this order.'
      });
    }

    next();
  } catch (error) {
    logger.error(`Cancel order validation error: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

module.exports = {
  verifyToken,
  verifyOrderAccess,
  isAdmin,
  validateOrderData,
  validateOrderStatusUpdate,
  canCancelOrder
};