const Category = require('../models/Category');

/**
 * GET /api/v1/categories
 */
exports.getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/v1/categories/:id
 */
exports.getCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.status(200).json({ success: true, data: category });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/v1/categories  (admin only)
 */
exports.createCategory = async (req, res, next) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json({
            success: true,
            message: 'Category created',
            data: category,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/v1/categories/:id  (admin only)
 */
exports.updateCategory = async (req, res, next) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Category updated',
            data: category,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/v1/categories/:id  (admin only)
 */
exports.deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.status(200).json({ success: true, message: 'Category deleted', data: {} });
    } catch (error) {
        next(error);
    }
};
