const Product = require('../model/productModel');

// Create a Product
const createProduct = async (productData) => {
    try {
        const product = new Product(productData);
        await product.save();
        console.log('\n--- Product Created ---');
        console.log(product);
        return product;
    } catch (error) {
        console.error('Error creating product:', error.message);
    }
};

// Read All Products
const readAllProducts = async () => {
    try {
        const products = await Product.find();
        console.log('\n--- All Products ---');
        console.log(products);
        return products;
    } catch (error) {
        console.error('Error reading products:', error.message);
    }
};

// Update a Product (update price and category based on name)
const updateProduct = async (name, newPrice, newCategory) => {
    try {
        const product = await Product.findOneAndUpdate(
            { name: name },
            { $set: { price: newPrice, category: newCategory } },
            { new: true } // Return the updated document
        );
        if (product) {
            console.log(`\n--- Product '${name}' Updated ---`);
            console.log(product);
        } else {
            console.log(`\n--- Product '${name}' not found for update ---`);
        }
        return product;
    } catch (error) {
        console.error('Error updating product:', error.message);
    }
};

// Delete a Product (remove based on name)
const deleteProduct = async (name) => {
    try {
        const product = await Product.findOneAndDelete({ name: name });
        if (product) {
            console.log(`\n--- Product '${name}' Deleted ---`);
            console.log(product);
        } else {
            console.log(`\n--- Product '${name}' not found for deletion ---`);
        }
        return product;
    } catch (error) {
        console.error('Error deleting product:', error.message);
    }
};

// Find product by category (find all products within a specific category)
const findProductsByCategory = async (category) => {
    try {
        const products = await Product.find({ category: category });
        console.log(`\n--- Products in category '${category}' ---`);
        console.log(products);
        return products;
    } catch (error) {
        console.error('Error finding products by category:', error.message);
    }
};

module.exports = {
    createProduct,
    readAllProducts,
    updateProduct,
    deleteProduct,
    findProductsByCategory
};
