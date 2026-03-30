const express = require('express');
const router = express.Router();
const { placeOrder, getOrders, getUserOrders, updateStatus, cancelOrder, deleteOrder } = require('../controllers/ordercontroller');

router.post('/', placeOrder);
router.get('/', getOrders);
router.get('/user/:email', getUserOrders);
router.put('/:id', updateStatus);
router.put('/cancel/:id', cancelOrder); // Cancel route
router.delete('/:id', deleteOrder);    // Delete history route

module.exports = router;