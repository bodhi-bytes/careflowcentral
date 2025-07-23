const express = require('express');
const router = express.Router();
const {
  createUser,
  getAllUsers,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteUser
} = require('./controllers/userController'); // Corrected path

// Create (POST) - Add a new user (Note: For primary registration, use /api/auth/register)
router.post('/', createUser);

// Read (GET) - Get all users
router.get('/', getAllUsers);

// Read (GET) - Get a user by ID
router.get('/:id', getUserById);

// Read (GET) - Get a user by email
router.get('/email/:email', getUserByEmail);

// Update (PUT) - Update an existing user by ID
router.put('/:id', updateUser);

// Delete (DELETE) - Delete a user by ID
router.delete("/:id", deleteUser);

module.exports = router;
