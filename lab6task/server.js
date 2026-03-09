const mongoose = require('mongoose');
const connectDB = require('./config/db');
const {
    createProduct,
    readAllProducts,
    updateProduct,
    deleteProduct,
    findProductsByCategory
} = require('./controller/productController');

const run = async () => {
    // 1. Database Connection
    await connectDB();

    // Clear the collection to have a clean start (optional, but good for demo)
    try {
        await mongoose.connection.collection('products').deleteMany({});
        console.log('Cleared existing products from the collection for clean demo.\n');
    } catch (e) {
        // ignore if collection doesn't exist yet
    }

    // 2. Create products
    console.log('--- Step 1: Create a Product ---');
    await createProduct({
        name: 'Gaming Laptop',
        price: 1500,
        category: 'Electronics',
        inStock: true
    });

    // Create another one for variety
    await createProduct({
        name: 'Office Desk',
        price: 250,
        category: 'Furniture',
        inStock: true
    });

    // 3. Read All Products
    console.log('\n--- Step 2: Read All Products ---');
    await readAllProducts();

    // 4. Update a Product (update price and category based on name)
    console.log('\n--- Step 3: Update a Product ---');
    await updateProduct('Gaming Laptop', 1350, 'Electronics (On Sale)');

    // 5. Find product by category
    console.log('\n--- Step 4: Find products by category ---');
    await findProductsByCategory('Electronics (On Sale)');

    // 6. Delete a Product
    console.log('\n--- Step 5: Delete a Product ---');
    await deleteProduct('Office Desk');

    // Verify deletion
    console.log('\n--- Final state of products ---');
    await readAllProducts();

    // Close connection
    await mongoose.connection.close();
    console.log('\nConnection closed.');
};

run();
