const express = require('express');
const User = require('../models/user');
const userRouter = express.Router();
const userAuth = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest');

userRouter.get('/users/received', userAuth, async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUserId,
      status: "interested"
    }).populate('fromUserId', 'firstName lastName photoUrl').exec();

    // If no requests found
    if (connectionRequests.length === 0) {
      return res.status(200).json({ message: "No connection requests received.", receivedRequests: [] });
    }

    // Return the request
    res.status(200).json({
      message: "Received connection requests fetched successfully.",
      receivedRequests: connectionRequests
    });

  } catch (error) {
    console.error("Error fetching received requests:", error);
    res.status(500).json({
      message: "Failed to fetch received requests.",
      error: error.message
    });
  }
});
userRouter.get('/users/connections', userAuth, async (req, res) => {
  try {
    const loggedInUserId = req.user._id.toString();

    // ✅ Fetch all accepted connections where the user is either sender or receiver
    const connections = await ConnectionRequest.find({
      status: 'accepted',
      $or: [
        { fromUserId: loggedInUserId },
        { toUserId: loggedInUserId }
      ]
    })
      .populate('fromUserId', 'firstName lastName photoUrl gender age about')
      .populate('toUserId', 'firstName lastName photoUrl gender age  about');

    // ✅ Format response: extract "other user" from each connection
    const formattedConnections = connections.map(conn => {
      const isSender = conn.fromUserId._id.toString() === loggedInUserId;
      const otherUser = isSender ? conn.toUserId : conn.fromUserId;

      return {
        _id: otherUser._id,
        firstName: otherUser.firstName,
        lastName: otherUser.lastName,
        photoUrl: otherUser.photoUrl,
        gender: otherUser.gender,
        age: otherUser.age,
        about:otherUser.about
      };
    });

    res.status(200).json({
      message: formattedConnections.length
        ? "Connections fetched successfully."
        : "No connections found.",
      connections: formattedConnections
    });

  } catch (error) {
    console.error("Error fetching connections:", error);
    res.status(500).json({
      message: "Failed to fetch connections.",
      error: error.message
    });
  }
});

userRouter.get('/feed', userAuth, async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // Pagination defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get all connection requests involving the user
    const requests = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUserId },
        { toUserId: loggedInUserId }
      ]
    });

    const excludedUserIds = new Set();
    excludedUserIds.add(loggedInUserId.toString());

    requests.forEach(req => {
      const { fromUserId, toUserId, status } = req;

      if (status === 'accepted') {
        excludedUserIds.add(fromUserId.toString());
        excludedUserIds.add(toUserId.toString());
      }

      if (fromUserId.toString() === loggedInUserId.toString()) {
        excludedUserIds.add(toUserId.toString());
      }

      if (toUserId.toString() === loggedInUserId.toString()) {
        if (status === 'interested' || status === 'ignored') {
          excludedUserIds.add(fromUserId.toString());
        }
      }
    });

    // Count total for pagination metadata
    const totalUsers = await User.countDocuments({
      _id: { $nin: Array.from(excludedUserIds) }
    });

    // Fetch paginated users
    const feedUsers = await User.find({
      _id: { $nin: Array.from(excludedUserIds) }
    })
      .select('firstName lastName photoUrl gender age')
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      message: "Feed fetched successfully.",
      page,
      limit,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
      users: feedUsers
    });
  } catch (error) {
    console.error("Error fetching feed:", error);
    res.status(500).json({
      message: "Failed to fetch feed.",
      error: error.message
    });
  }
});

module.exports = userRouter;
