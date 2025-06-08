const Product = require("../models/Product");
const Order = require("../models/Order");
const Review = require("../models/Review");
const logger = require("./logger");

/**
 * POST /api/listings
 * Create a new product listing.
 * The authenticated user's id (req.user.id) is set as the seller.
 */
exports.createListing = async (req, res) => {
    const { title, description, price, stock, category, tags } = req.body;
    const seller = req.user.id;
    const sellerName = req.user.name;
    try {
      // Build the images array from req.files.
      let imageUrls = [];
      if (req.files && req.files.length > 0) {
        // Map each file to a relative URL.
        // For example: /uploads/filename.ext
        imageUrls = req.files.map(file => `/uploads/${file.filename}`);
      }
      
      const newProduct = new Product({
        title,
        description,
        images: imageUrls,
        price,
        stock,
        category,
        seller,
        tags
      });
  
      await newProduct.save();
      logger.success(`Product listing created by seller ${sellerName}`);
      logger.info(`║ Product ID: ${newProduct._id}`);
      return res.status(201).json({ message: "Listing created successfully", product: newProduct });
    } catch (err) {
      logger.error("Error creating listing: " + err.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

/**
 * GET /api/listings
 * Retrieve all active product listings.
 */
exports.getListings = async (req, res) => {
  try {
    const products = await Product.find({ active: true })
      .populate("seller", "name userName email");
    return res.json(products);
  } catch (err) {
    logger.error("Error retrieving listings: " + err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /api/listings/:id
 * Retrieve a single product listing by its id.
 */
exports.getListingById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const product = await Product.findById(id)
      .populate("seller", "name userName email");

    if (!product) return res.status(404).json({ message: "Listing not found" });

    return res.json(product);
  } catch (err) {
    logger.error("Error retrieving listing by id: " + err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * PATCH /api/listings/:id
 * Update a product listing.
 * Only the seller who created the listing is allowed to update it.
 */
exports.updateListing = async (req, res) => {
  const { id } = req.params;
  // The fields to update will be provided in req.body.
  const updateData = req.body;
  const userId = req.user.id;

  try {
    // Look for the product listing.
    const product = await Product.findById(id);
    if (!product) {
      logger.warning(`Attempt to update non-existent listing ${id} by user ${userId}`);
      return res.status(404).json({ message: "Listing not found" });
    }
    
    // Ensure the requesting user is the seller.
    if (product.seller.toString() !== userId) {
      logger.warning(`User ${userId} attempted to update listing ${id} which they do not own`);
      return res.status(403).json({ message: "Not authorized to update this listing" });
    }
    
    // Update allowed fields.
    Object.assign(product, updateData);
    
    await product.save();
    logger.success(`Product listing ${id} updated by user ${userId}`);
    return res.status(200).json({ message: "Listing updated successfully", product });
  } catch (err) {
    logger.error("Error updating listing: " + err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /api/listings/:productId/reviews
 * Submit a review for a product listing.
 * Only allowed if the user (buyer) has an order with status "delivered" 
 * that includes the specified product.
 */
exports.submitReview = async (req, res) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user.id;

  try {
    // Ensure the product exists.
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Validate rating.
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Check if the user has at least one delivered order that includes this product.
    const order = await Order.findOne({
      buyer: userId,
      status: "delivered",
      "items.product": productId
    });
    if (!order) {
      return res.status(403).json({
        message: "You can only review a product that you have purchased and received"
      });
    }

    // Optionally, prevent duplicate reviews by the same user on the same product.
    const existingReview = await Review.findOne({ user: userId, product: productId });
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

    const review = new Review({
      user: userId,
      product: productId,
      rating,
      comment
    });
    await review.save();

    logger.success(`Review submitted for product ${productId} by user ${userId}`);
    return res.status(201).json({ message: "Review submitted successfully", review });
  } catch (err) {
    logger.error("Error submitting review: " + err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};


/**
 * GET /api/listings/mine
 * Get all listings created by the authenticated user (seller).
 */
exports.getMyListings = async (req, res) => {
  const userId = req.user.id;

  try {
    const listings = await Product.find({ seller: userId })
      .populate("seller", "name userName email");

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // Add full URL to image paths
    const listingsWithFullImageUrls = listings.map(listing => ({
      ...listing.toObject(),
      images: listing.images.map(img => `${baseUrl}${img.startsWith("/") ? "" : "/"}${img}`)
    }));

    return res.status(200).json(listingsWithFullImageUrls);
  } catch (err) {
    logger.error(`Error retrieving user's own listings: ${err.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};

