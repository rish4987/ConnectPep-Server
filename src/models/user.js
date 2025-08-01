const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required.'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required.'],
      trim: true
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Non-binary", "Other", "Prefer not to say"],
      required: [true, 'Gender is required.']
    },
    age: {
      type: Number,
      min: [18, 'You must be at least 18 years old.'],
      required: [true, 'Age is required.']
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      minlength: [6, 'Password must be at least 6 characters long.'],
      
      },
    photoUrl: {
      type: String,
      required: [true, 'A profile photo is required.'],
      trim: true
    },
    about: {
      type: String,
      maxLength: [500, 'About section cannot exceed 500 characters.'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true,
      
      }
    ,
    
  },
  
  {
    timestamps: true
  }

);

// Hash password before saving
userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});

// JWT generation
userSchema.methods.getJWT = function () {
  const user = this;
  const secret = 'Dev@tinder$12323';
  return jwt.sign({ id: user._id }, secret, { expiresIn: '1d' });
};

// Password validation
userSchema.methods.validatePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
