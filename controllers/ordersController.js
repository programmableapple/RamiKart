// orderController.js
const Product = require('../models/Product'); // adjust path if needed
const Order = require('../models/Order'); // adjust path if needed
const logger = require("./logger");

exports.createOrder = async (req, res) => {
  try {
    // Ensure user is logged in
    const buyer = req.user?.id;
    if (!buyer) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
    }

    const { items, paymentInfo, shippingAddress } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item.' });
    }

    let totalCalculated = 0;
    const processedItems = [];

    for (const item of items) {
      const { product: productId, quantity } = item;

      // Validate quantity
      if (!quantity || quantity <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid quantity for a product.' });
      }

      // Fetch product from database
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ success: false, message: `Product with ID ${productId} not found.` });
      }

      // Calculate total
      const itemTotal = product.price * quantity;
      totalCalculated += itemTotal;

      processedItems.push({
        product: product._id,
        quantity,
        priceAtPurchase: product.price
      });
    }

    // Create order
    const newOrder = new Order({
      buyer,
      items: processedItems,
      total: totalCalculated,
      paymentInfo,
      shippingAddress
    });

    const savedOrder = await newOrder.save();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: savedOrder
    });
  } catch (error) {
    logger.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ buyer: userId }).populate('items.product');

    if (!orders) {
      return res.status(404).json({ message: 'No orders found for this user' });
    }

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    logger.error(`Error fetching user orders: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
}

exports.cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;

    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if the order belongs to the user
    if (order.buyer.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized. You can only cancel your own orders' 
      });
    }

    // Check if the order can be canceled
    const allowedStatusForCancellation = ['pending', 'processing', 'confirmed'];
    if (!allowedStatusForCancellation.includes(order.status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Order cannot be canceled because it is already in ${order.status} status` 
      });
    }

    // Update order status to cancelled
    order.status = 'cancelled';
    await order.save();

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
    
  } catch (error) {
    logger.error(`Error canceling order: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};


exports.updateOrderStatus = async (req, res) => {
  
}

