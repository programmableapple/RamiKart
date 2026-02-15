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
  const { title, description, price, stock, category, tags, active } = req.body;
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
      tags,
      active: active === 'true' || active === true
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
  const userId = req.user.id;

  try {
    // Look for the product listing.
    const product = await Product.findById(id);
    if (!product) {
      logger.warning(`Attempt to update non-existent listing ${id} by user ${userId}`);
      return res.status(404).json({ message: "Listing not found" });
    }

    // Ensure the requesting user is the seller (admins can bypass).
    if (product.seller.toString() !== userId && req.user.role !== 'admin') {
      logger.warning(`User ${userId} attempted to update listing ${id} which they do not own`);
      return res.status(403).json({ message: "Not authorized to update this listing" });
    }

    // Extract fields from request body
    const {
      title,
      description,
      price,
      stock,
      category,
      tags,
      active,
      keepImages // This will be sent as an array of strings (URLs) of images to keeping
    } = req.body;

    // Handle images
    // 1. Start with images the user wants to keep
    let finalImages = [];

    // req.body.keepImages might be a single string if only one image is kept, or an array, or undefined
    if (keepImages) {
      if (Array.isArray(keepImages)) {
        finalImages = keepImages;
      } else {
        finalImages = [keepImages];
      }
    }

    // 2. Add new uploaded images
    if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map(file => `/uploads/${file.filename}`);
      finalImages = [...finalImages, ...newImageUrls];
    }

    // Update fields
    if (title) product.title = title;
    if (description) product.description = description;
    if (price) product.price = price;
    if (stock) product.stock = stock;
    if (category) product.category = category;
    if (tags) product.tags = tags; // Assuming tags is sent as array or handled by frontend to be array

    // Handle active status which comes as string "true"/"false" in form-data
    if (active !== undefined) {
      product.active = active === 'true' || active === true;
    }

    // Update images array
    // If no images were sent (neither keepImages nor new files) and it was a multipart request, 
    // it implies clearing images or frontend didn't send them. 
    // However, usually we want to update images only if changes are explicitly made. 
    // But since frontend logic sends 'keepImages', we trust the constructed array.
    // If keepImages is undefined and req.files is empty, we might accidentally wipe all images if we just set it.
    // So let's be careful: if both are missing, we might assume no change to images intended?
    // OR we assume the frontend ALWAYS sends the full state of images.
    // Based on the frontend code provided:
    // "existingImages.forEach(img => submitData.append("keepImages", img));"
    // "images.forEach((image) => { submitData.append("images", image) })"
    // So the frontend sends the complete desired state.
    // Thus, finalImages is indeed the new state.

    // However, if the request didn't include keepImages AND didn't include files, it might mean "delete all images"
    // OR it might be a partial update (if we weren't using multipart).
    // Given we added upload.array(), this is likely always multipart for this route now.

    // To be safe against unintentional clears if frontend logic is partial:
    // (But frontend seems to send everything).
    product.images = finalImages;


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

    // Return listings directly with relative paths
    // The frontend should check for relative paths and use the proxy or base URL
    // Since images are stored as /uploads/filename, they are already relative
    return res.status(200).json(listings);
  } catch (err) {
    logger.error(`Error retrieving user's own listings: ${err.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * DELETE /api/listings/:id
 * Delete a product listing.
 * Only the seller who created the listing is allowed to delete it.
 */
exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Admins can delete any listing
    if (product.seller.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized to delete this listing" });
    }

    await Product.findByIdAndDelete(id);
    logger.success(`Product listing ${id} deleted by user ${userId}`);
    return res.status(200).json({ message: "Listing deleted successfully" });
  } catch (err) {
    logger.error("Error deleting listing: " + err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /api/listings/all
 * Admin-only: Retrieve ALL product listings (active and inactive) from all users.
 */
exports.getAllListings = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("seller", "name userName email")
      .sort({ createdAt: -1 });
    return res.json(products);
  } catch (err) {
    logger.error("Error retrieving all listings (admin): " + err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
