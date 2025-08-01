const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['ignored','interested', 'accepted', 'rejected'],
        default: 'interested'
        

    },
    createdAt: {
        type: Date,
        default: Date.now

    },


},
{    timestamps: true
});
// connectionRequestSchema.pre('save', function(next) {
//     if(!this.fromUserId || !this.toUserId) {
//         return next(new Error("Both fromUserId and toUserId are required."));
//     }
//     if (this.fromUserId.toString() === this.toUserId.toString()) {
//         return next(new Error("You cannot send a request to yourself."));
//     }
    
//     next();

// });

const ConnectionRequest = new mongoose.model('ConnectionRequest', connectionRequestSchema);
module.exports = ConnectionRequest;