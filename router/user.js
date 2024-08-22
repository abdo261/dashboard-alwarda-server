const express = require('express');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/user');

const userRouter = express.Router();

// Get all users
userRouter.get('/', getAllUsers);

// Get a user by ID
userRouter.get('/:id', getUserById);

// Create a new user
userRouter.post('/', createUser);

// Update a user by ID
userRouter.put('/:id', updateUser);

// Delete a user by ID
userRouter.delete('/:id', deleteUser);

module.exports = userRouter;
