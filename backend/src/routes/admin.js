import express from 'express';
import User from '../models/User.js';
import { LostItem, FoundItem, Claim, SuccessfulReturn } from '../models/Item.js';
import auth from '../middleware/auth.js';
import mongoose from 'mongoose'; // Import mongoose for aggregation

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  // req.user is populated by the auth middleware
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access denied' });
  }
};

// Get dashboard stats (protected - admin only)
router.get('/stats', auth, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    // Calculate total found items
    const totalFoundItems = await FoundItem.countDocuments();
    // Set totalItems to only count found items as requested
    const totalItems = totalFoundItems; // Updated calculation

    // Count pending claims
    const pendingClaims = await Claim.countDocuments({ status: 'pending' }); // Renamed for clarity
    // Count resolved items (successful returns)
    const resolvedItems = await SuccessfulReturn.countDocuments();

    // --- New Statistics --- //
    // Count distinct Found Items that have at least one pending claim
    const itemsWithPendingClaims = await Claim.distinct('foundItemId', { status: 'pending' });
    const countItemsWithPendingClaims = itemsWithPendingClaims.length;

    // Count Found Items that are not yet claimed (isClaimed: false)
    const unclaimedOpenItems = await FoundItem.countDocuments({ isClaimed: false });
    // --- End New Statistics --- //

    res.json({
      totalUsers,
      totalItems,
      pendingItems: pendingClaims,
      resolvedItems,
      // Include new stats in the response
      itemsWithPendingClaims: countItemsWithPendingClaims,
      unclaimedOpenItems: unclaimedOpenItems,
    });
  } catch (error) {
    console.error('Admin Stats Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add route for Trending Categories (protected - admin only)
router.get('/stats/trending-categories', auth, isAdmin, async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Aggregate Found Items to count by category in the last 7 days
    const trendingFound = await FoundItem.aggregate([
      { $match: { timeFound: { $gte: sevenDaysAgo } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }, // Sort by count descending
      { $limit: 5 } // Get top 5 trending categories
    ]);

    // Aggregate Lost Items to count by category in the last 7 days
     const trendingLost = await LostItem.aggregate([
      { $match: { timeLost: { $gte: sevenDaysAgo } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }, // Sort by count descending
      { $limit: 5 } // Get top 5 trending categories
    ]);

    // Combine results (handle potential overlap or just return separate lists for now)
    // For simplicity, let's combine and sum counts for the same category, then sort
    const combinedTrends = {};

    trendingFound.forEach(item => {
      combinedTrends[item._id] = (combinedTrends[item._id] || 0) + item.count;
    });

     trendingLost.forEach(item => {
      combinedTrends[item._id] = (combinedTrends[item._id] || 0) + item.count;
    });

    // Convert back to array and sort
    const sortedTrends = Object.keys(combinedTrends).map(key => ({
      category: key,
      count: combinedTrends[key]
    })).sort((a, b) => b.count - a.count).slice(0, 5); // Get top 5 overall


    res.json(sortedTrends);

  } catch (error) {
    console.error('Admin Trending Categories Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all users (protected - admin only)
router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    // Exclude password and tokens fields
    const users = await User.find().select('-password -tokens');
    res.json(users);
  } catch (error) {
    console.error('Admin Get Users Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a user (protected - admin only)
router.delete('/users/:id', auth, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (req.user._id.toString() === userId) {
        return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting the last admin user (optional safeguard)
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (user.role === 'admin' && adminCount <= 1) {
         return res.status(400).json({ message: 'Cannot delete the last admin user' });
    }

    // Consider also deleting items reported by this user or transferring ownership
    // For now, we'll just delete the user
    await user.deleteOne();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Admin Delete User Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all lost items (protected - admin only)
router.get('/items/lost', auth, isAdmin, async (req, res) => {
  try {
    const lostItems = await LostItem.find()
      .populate('userId', 'name email phoneNumber');
    res.json(lostItems);
  } catch (error) {
    console.error('Admin Get Lost Items Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all found items (protected - admin only)
router.get('/items/found', auth, isAdmin, async (req, res) => {
  try {
    const foundItems = await FoundItem.find()
      .populate('userId', 'name email phoneNumber');
    res.json(foundItems);
  } catch (error) {
    console.error('Admin Get Found Items Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all claims (protected - admin only)
router.get('/claims', auth, isAdmin, async (req, res) => {
  try {
    const claims = await Claim.find()
      .populate('foundItemId')
      .populate('lostItemId')
      .populate('claimantId', 'name email phoneNumber');
    res.json(claims);
  } catch (error) {
    console.error('Admin Get Claims Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all successful returns (protected - admin only)
router.get('/returns', auth, isAdmin, async (req, res) => {
  try {
    const returns = await SuccessfulReturn.find()
      .populate('lostItemId')
      .populate('foundItemId');
    res.json(returns);
  } catch (error) {
    console.error('Admin Get Returns Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update lost item status (protected - admin only)
router.put('/items/lost/:id', auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isClaimed } = req.body;

    const lostItem = await LostItem.findById(id);
    if (!lostItem) {
      return res.status(404).json({ message: 'Lost item not found' });
    }

    lostItem.isClaimed = isClaimed;
    await lostItem.save();

    res.json({ message: 'Lost item updated successfully', lostItem });
  } catch (error) {
    console.error('Admin Update Lost Item Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update found item status (protected - admin only)
router.put('/items/found/:id', auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isClaimed } = req.body;

    const foundItem = await FoundItem.findById(id);
    if (!foundItem) {
      return res.status(404).json({ message: 'Found item not found' });
    }

    foundItem.isClaimed = isClaimed;
    await foundItem.save();

    res.json({ message: 'Found item updated successfully', foundItem });
  } catch (error) {
    console.error('Admin Update Found Item Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update claim status (protected - admin only)
router.put('/claims/:id', auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const claim = await Claim.findById(id);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    claim.status = status;
    await claim.save();

    // If claim is accepted, update the related items
    if (status === 'accepted') {
      if (claim.foundItemId) {
        await FoundItem.findByIdAndUpdate(claim.foundItemId, { isClaimed: true });
      }
      if (claim.lostItemId) {
        await LostItem.findByIdAndUpdate(claim.lostItemId, { isClaimed: true });
        
        // Create successful return record
        const successfulReturn = new SuccessfulReturn({
          lostItemId: claim.lostItemId,
          foundItemId: claim.foundItemId,
          returnDate: new Date()
        });
        await successfulReturn.save();
      }
    }

    res.json({ message: 'Claim updated successfully', claim });
  } catch (error) {
    console.error('Admin Update Claim Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router; 