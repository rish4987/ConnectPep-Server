const express = require('express');
const mongoose = require('mongoose');
const requestRouter = express.Router();
const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/user');
const userAuth = require('../middlewares/auth');

const requestStatus = {
  ignored: 'ignored',
  interested: 'interested',
  accepted: 'accepted',
  rejected: 'rejected',
};

const validateSendStatus = [requestStatus.ignored, requestStatus.interested];
const validateReviewStatus = [requestStatus.accepted, requestStatus.rejected];

// Send connection request
requestRouter.post('/request/send/:status/:toUserId', userAuth, async (req, res) => {
  try {
    const { status, toUserId } = req.params;
    const fromUserId = req.user._id.toString();

    if (!validateSendStatus.includes(status)) {
      return res.status(400).json({ message: 'Invalid request status.' });
    }

    if (!mongoose.Types.ObjectId.isValid(toUserId)) {
      return res.status(400).json({ message: 'Invalid user ID format.' });
    }

    if (fromUserId === toUserId) {
      return res.status(400).json({ message: 'You cannot send a request to yourself.' });
    }

    const existingRequest = await ConnectionRequest.findOne({
      fromUserId,
      toUserId,
    });

    if (existingRequest) {
      return res.status(409).json({ message: 'Request already sent.' });
    }

    const newRequest = new ConnectionRequest({
      fromUserId,
      toUserId,
      status,
    });
    await newRequest.save();

    res.status(201).json({ message: 'Request sent successfully!' });
  } catch (error) {
    console.error('Error sending request:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Review connection request
requestRouter.patch('/request/review/:status/:requestId', userAuth, async (req, res) => {
  try {
    const { status, requestId } = req.params;
    const userId = req.user._id.toString();

    if (!validateReviewStatus.includes(status)) {
      return res.status(400).json({ message: 'Invalid review status.' });
    }

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: 'Invalid request ID format.' });
    }

    const request = await ConnectionRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: 'Connection request not found.' });
    }

    if (request.toUserId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized to review this request.' });
    }

    request.status = status;
    await request.save();

    res.status(200).json({ message: 'Request reviewed successfully.' });
  } catch (error) {
    console.error('Error reviewing request:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Get all connection requests received
requestRouter.get('/requests', userAuth, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { limit = 10, page = 1 } = req.query;

    const connectionRequests = await ConnectionRequest.find({
      toUserId: userId,
      status: requestStatus.interested,
    })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('fromUserId', 'firstName lastName photoUrl')
      .exec();

    const total = await ConnectionRequest.countDocuments({
      toUserId: userId,
      status: requestStatus.interested,
    });

    res.status(200).json({
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      requests: connectionRequests,
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Get all connection requests sent by the user
requestRouter.get('/requests/sent', userAuth, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { limit = 10, page = 1 } = req.query;

    const sentRequests = await ConnectionRequest.find({
      fromUserId: userId,
    })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('toUserId', 'firstName lastName photoUrl')
      .exec();

    const total = await ConnectionRequest.countDocuments({
      fromUserId: userId,
    });

    res.status(200).json({
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      requests: sentRequests,
    });
  } catch (error) {
    console.error('Error fetching sent requests:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Cancel a sent connection request
requestRouter.delete('/request/cancel/:requestId', userAuth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id.toString();

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: 'Invalid request ID format.' });
    }

    const request = await ConnectionRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: 'Connection request not found.' });
    }

    if (request.fromUserId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized to cancel this request.' });
    }

    await ConnectionRequest.deleteOne({ _id: requestId });

    res.status(200).json({ message: 'Request cancelled successfully.' });
  } catch (error) {
    console.error('Error cancelling request:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = requestRouter;
