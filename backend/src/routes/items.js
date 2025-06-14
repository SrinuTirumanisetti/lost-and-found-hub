import express from 'express';
import { LostItem, FoundItem, Claim, SuccessfulReturn } from '../models/Item.js';
import auth from '../middleware/auth.js';
import mongoose from 'mongoose'; // Import mongoose for aggregation

const router = express.Router();

// Get all lost items (public - showing only unclaimed)
router.get('/lost', async (req, res) => {
  try {
    const lostItems = await LostItem.find({ isClaimed: false })
      .populate('userId', 'name email phoneNumber');
    res.json(lostItems);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all found items (public - showing only unclaimed)
router.get('/found', async (req, res) => {
  try {
    const foundItems = await FoundItem.find({ isClaimed: false })
      .populate('userId', 'name email phoneNumber');
    res.json(foundItems);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add route for Trending Categories (accessible to authenticated users)
router.get('/stats/trending-categories', auth, async (req, res) => {
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

    // Combine results and sum counts for the same category, then sort
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
    console.error('User Trending Categories Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Report a lost item (protected)
router.post('/lost', auth, async (req, res) => {
  try {
    const { name, category, description, locationLost, timeLost, contactEmail, contactPhone, reward } = req.body;

    const newLostItem = new LostItem({
      userId: req.user._id,
      name,
      category,
      description,
      locationLost,
      timeLost,
      contactEmail,
      contactPhone,
      reward,
      isClaimed: false
    });

    const item = await newLostItem.save();
    res.status(201).json(item);
  } catch (error) {
    console.error('Report Lost Item Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Report a found item (protected)
router.post('/found', auth, async (req, res) => {
  try {
    const { name, category, description, locationFound, timeFound, contactEmail, contactPhone, securityQuestion } = req.body;

    // Validate required fields
    if (!name || !category || !description || !locationFound || !timeFound || !contactEmail || !contactPhone || !securityQuestion) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        details: {
          name: !name ? 'Name is required' : null,
          category: !category ? 'Category is required' : null,
          description: !description ? 'Description is required' : null,
          locationFound: !locationFound ? 'Location is required' : null,
          timeFound: !timeFound ? 'Time found is required' : null,
          contactEmail: !contactEmail ? 'Contact email is required' : null,
          contactPhone: !contactPhone ? 'Contact phone is required' : null,
          securityQuestion: !securityQuestion ? 'Security question is required' : null
        }
      });
    }

    const newFoundItem = new FoundItem({
      userId: req.user._id,
      name,
      category,
      description,
      locationFound,
      timeFound: new Date(timeFound),
      contactEmail,
      contactPhone,
      securityQuestion,
      isClaimed: false,
    });

    const item = await newFoundItem.save();
    res.status(201).json(item);
  } catch (error) {
    console.error('Report Found Item Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit a claim for a found item (protected)
router.post('/:id/claim', auth, async (req, res) => {
  try {
    const foundItemId = req.params.id;
    const { answer, lostItemId } = req.body;
    const claimantId = req.user._id;

    const foundItem = await FoundItem.findById(foundItemId);
    if (!foundItem || foundItem.isClaimed) {
      return res.status(400).json({ message: 'Item not available for claiming' });
    }

    if (foundItem.userId.toString() === claimantId.toString()) {
      return res.status(400).json({ message: 'Cannot claim your own reported item' });
    }

    // Check for existing claim
    const existingClaim = await Claim.findOne({
      foundItemId,
      claimantId,
      status: 'pending'
    });

    if (existingClaim) {
      return res.status(400).json({ message: 'You have already submitted a claim for this item' });
    }

    const newClaim = new Claim({
      lostItemId,
      foundItemId,
      claimantId,
      answer,
      status: 'pending'
    });

    await newClaim.save();
    res.json({ message: 'Claim submitted successfully', claim: newClaim });
  } catch (error) {
    console.error('Submit Claim Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Handle claim response (protected - only item reporter can respond)
router.post('/claims/:claimId/respond', auth, async (req, res) => {
  try {
    const { claimId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    const claim = await Claim.findById(claimId)
      .populate('foundItemId');

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // Check if the user is the one who reported the found item
    if (claim.foundItemId.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Only the item reporter can respond to claims' });
    }

    claim.status = status;
    await claim.save();

    if (status === 'accepted') {
      // Update found item status
      await FoundItem.findByIdAndUpdate(claim.foundItemId._id, { isClaimed: true });

      // If there's a lost item ID, update its status (keep this part if needed)
      if (claim.lostItemId) {
        await LostItem.findByIdAndUpdate(claim.lostItemId, { isClaimed: true });
      }
        
      // Create successful return for ANY accepted claim
      const successfulReturn = new SuccessfulReturn({
        lostItemId: claim.lostItemId, // This is now optional in the schema
        foundItemId: claim.foundItemId._id,
        returnDate: new Date()
      });
      await successfulReturn.save();

    }

    res.json({ message: 'Claim response updated successfully', claim });
  } catch (error) {
    console.error('Claim Response Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's claims (protected)
router.get('/claims', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get claims submitted by the user
    // Conditionally populate foundItemId with contact info only if claim is accepted
    const submittedClaims = await Claim.find({ claimantId: userId })
      .populate({
        path: 'foundItemId',
        select: 'name category locationFound timeFound description securityQuestion userId contactEmail contactPhone', // Include all fields initially
      })
      .populate('lostItemId')
      .populate('claimantId', 'name email phoneNumber');

    // Manually filter contact info based on claim status for submitted claims
    const processedSubmittedClaims = submittedClaims.map(claim => {
        const claimObject = claim.toObject(); // Convert to plain object to modify
        if (claimObject.foundItemId && claimObject.status !== 'accepted') {
             // Exclude contact info if claim is not accepted
            delete claimObject.foundItemId.contactEmail;
            delete claimObject.foundItemId.contactPhone;
        }
         // Ensure reporter's userId is always included for checking if it's the current user's item
        if (claimObject.foundItemId) {
            claimObject.foundItemId.userId = claim.foundItemId.userId; // Keep the original userId from population
        }
        return claimObject;
    });

    // Get claims received on items reported by the user
    // Exclude reporter contact info for received claims
    const foundItems = await FoundItem.find({ userId });
    const foundItemIds = foundItems.map(item => item._id);
    
    const receivedClaims = await Claim.find({ 
      foundItemId: { $in: foundItemIds }
    })
    .populate({
        path: 'foundItemId',
        select: 'name category locationFound timeFound description securityQuestion userId', // Exclude contact info
    })
    .populate('lostItemId')
    .populate('claimantId', 'name email phoneNumber');

    res.json({
      submittedClaims: processedSubmittedClaims,
      receivedClaims
    });
  } catch (error) {
    console.error('Get Claims Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's items (protected)
router.get('/user/items', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const lostItems = await LostItem.find({ userId });
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

    res.json({
      lostItems,
      foundItems,
      successfulReturns
    });
  } catch (error) {
    console.error('Get User Items Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router; 