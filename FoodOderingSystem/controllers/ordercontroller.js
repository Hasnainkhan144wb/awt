const Order = require('../models/Order');

/**
 * 1. Order Place Karna (User)
 * Frontend se items, total, aur user details receive karke save karta hai.
 */
exports.placeOrder = async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (err) { 
        res.status(400).json({ msg: "Order placement failed. Please try again." }); 
    }
};

/**
 * 2. Order Cancel Karna (User - 2 Minute Limit)
 * Check karta hai ke order place hue 2 minute (120,000ms) se zyada to nahi hue.
 */
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ msg: "Order not found" });

        // Time Check: 2 minutes limit
        const diff = Date.now() - new Date(order.createdAt).getTime();
        if (diff > 120000) {
            return res.status(400).json({ msg: "Time limit exceeded! Cancellation is only allowed within 2 minutes." });
        }

        // Agar order already deliver ho raha ho to cancel nahi hona chahiye (optional logic)
        if (order.status === "Order Delivered") {
            return res.status(400).json({ msg: "Cannot cancel an order that is already delivered." });
        }

        order.status = "Cancelled";
        await order.save();
        res.json({ msg: "Order Cancelled Successfully", order });
    } catch (err) { 
        res.status(500).json({ msg: "Server Error during cancellation" }); 
    }
};

/**
 * 3. History Record Delete Karna (User)
 * User apne dashboard se specific order record delete kar sakta hai.
 */
exports.deleteOrder = async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ msg: "Order record removed from your history." });
    } catch (err) { 
        res.status(500).json({ msg: "Delete failed" }); 
    }
};

/**
 * 4. Admin ke liye tamam orders fetch karna
 * Dashboard par newest orders pehle dikhata hai.
 */
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) { 
        res.status(500).json({ msg: "Server Error: Could not fetch orders" }); 
    }
};

/**
 * 5. User ki apni History fetch karna (Role-based)
 * Sirf us email ke orders nikalta hai jo user login hai.
 */
exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userEmail: req.params.email }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) { 
        res.status(500).json({ msg: "Error fetching your history" }); 
    }
};

/**
 * 6. Admin Status Update (Admin)
 * Admin dropdown se "Order Received", "Order Prepared", ya "Order Delivered" select karega.
 */
exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id, 
            { status: status }, 
            { new: true }
        );
        res.json(order);
    } catch (err) { 
        res.status(400).json({ msg: "Failed to update order status." }); 
    }
};