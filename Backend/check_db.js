const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const checkProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/market_db'); // Adjust URI if needed
        console.log('Connected to DB');

        const products = await Product.find({});
        console.log(`Total products: ${products.length}`);

        const activeStocked = await Product.find({ active: true, stock: { $gt: 0 } });
        console.log(`Active and Stocked products: ${activeStocked.length}`);

        activeStocked.forEach(p => {
            console.log(`- ${p.title}: Stock=${p.stock}, Active=${p.active}, ID=${p._id}`);
        });

        const inactive = await Product.find({ active: false });
        console.log(`Inactive products: ${inactive.length}`);

        // Check if there are products with stock but active=false
        const stockedInactive = await Product.find({ active: false, stock: { $gt: 0 } });
        console.log(`Stocked but Inactive: ${stockedInactive.length}`);

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

checkProducts();
