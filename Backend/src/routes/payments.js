// Backend/src/routes/payments.js
const express = require('express');
const router = express.Router();
// Assuming you have a payments controller with the verification logic
const paymentController = require('../controllers/paymentController'); 

// Route to verify payment status after Cashfree redirects the user
router.get('/verify/:orderId', paymentController.verifyPayment);

module.exports = router;