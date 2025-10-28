// Backend/src/controllers/paymentController.js
const { Booking } = require('../../models');
const { PGFetchOrder } = require('../utils/cashfree');


exports.verifyPayment = async (req, res) => {
  const { orderId } = req.params;

  try {
    // 1. Fetch Order Status from Cashfree (PGFetchOrder)
    const pgResponse = await PGFetchOrder(orderId);

    if (!pgResponse.success) {
      return res.status(500).json({ success: false, message: pgResponse.error });
    }

    const { order_status, order_id } = pgResponse.data;

    // 2. Find the local booking using your system's order ID
    const booking = await Booking.findOne({ where: { paymentOrderId: order_id } });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    // 3. Update the local booking status based on the *Payment Gateway's* status
    if (order_status === "PAID") {
      await booking.update({ status: 'payment_success' });
      return res.json({ success: true, status: 'Payment Successful', booking });
    } else {
      await booking.update({ status: 'payment_failed' });
      return res.json({ success: false, status: 'Payment Failed', message: `Status: ${order_status}` });
    }

  } catch (error) {
    console.error('Payment Verification Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during verification.' });
  }
};