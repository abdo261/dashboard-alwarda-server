const express = require('express');
const {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment
} = require('../controllers/payment');

const paymentsRouter = express.Router();

// Create a new payment
paymentsRouter.post('/', createPayment);

// Get all payments
paymentsRouter.get('/', getAllPayments);

// Get a payment by ID
paymentsRouter.get('/:id', getPaymentById);

// Update a payment by ID
paymentsRouter.put('/:id', updatePayment);

// Delete a payment by ID
paymentsRouter.delete('/:id', deletePayment);

module.exports = paymentsRouter;
