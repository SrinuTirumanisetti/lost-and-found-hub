import express from 'express';
import User from '../models/User.js';
import { LostItem, FoundItem, SuccessfulReturn } from '../models/Item.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get user's own items (lost, found, and successful returns)
router.get('/items', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Items reported lost by the user
    const lostItems = await LostItem.find({ userId });

    // Items reported found by the user
    const foundItems = await FoundItem.find({ userId });
    
    // Get successful returns where user was either the finder or the loser
    const successfulReturns = await SuccessfulReturn.find({
      $or: [
        { lostItemId: { $in: lostItems.map(item => item._id) } },
        { foundItemId: { $in: foundItems.map(item => item._id) } }
      ]
    })
    .populate('lostItemId')
    .populate('foundItemId');

    res.json({ lostItems, foundItems, successfulReturns });
  } catch (error) {
    console.error('Get User Items Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add route for user to update their lost item status
router.put('/items/lost/:id', auth, async (req, res) => {
  try {
    const { id } = req.params; // Lost item ID from URL
    const userId = req.user._id; // Authenticated user's ID
    const { isClaimed } = req.body; // Status update from request body

    // Find the lost item by ID
    const lostItem = await LostItem.findById(id);

    // Check if item exists and belongs to the authenticated user
    if (!lostItem) {
      return res.status(404).json({ message: 'Lost item not found' });
    }
    if (lostItem.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You are not authorized to update this item' });
    }

    // Update the status (only allow isClaimed for now)
    if (typeof isClaimed === 'boolean') {
        lostItem.isClaimed = isClaimed;
    }

    // Save the updated item
    await lostItem.save();

    res.json({ message: 'Lost item status updated successfully', lostItem });

  } catch (error) {
    console.error('User Update Lost Item Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get authenticated user's profile (protected)
router.get('/profile', auth, async (req, res) => {
  try {
    // req.user is populated by the auth middleware and contains the user object
    // We can directly send the user object, excluding sensitive fields
    const userProfile = await User.findById(req.user._id).select('-password -tokens');
    if (!userProfile) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(userProfile);
  } catch (error) {
    console.error('Get User Profile Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Future routes for managing user profile, etc.

export default router; 