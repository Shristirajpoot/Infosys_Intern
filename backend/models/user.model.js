const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    lowercase: true,
    required: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },

  password: {
    type: String,
    required: true,
    minLength: 6,
  },

  role: {
    type: String,
    enum: ['volunteer', 'ngo', 'admin'],
    required: true,
    default: 'volunteer',
  },

  skills: {
    type: Array,
    default: [],
  },

  location: {
    type: String,
    required: true
  },

  // Detailed location for matching
  coordinates: {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    }
  },

  // Waste type preferences for volunteers
  wasteTypePreferences: [{
    type: String,
    enum: [
      'organic',
      'plastic', 
      'paper',
      'glass',
      'metal',
      'electronic',
      'hazardous',
      'textile',
      'construction',
      'medical'
    ]
  }],

  // Available days/times for volunteers
  availability: {
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    timePreference: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'flexible']
    }
  },

  // Maximum travel distance willing to go (in km)
  maxTravelDistance: {
    type: Number,
    default: 10,
    min: 1,
    max: 100
  },

  // Experience level
  experienceLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },

  bio: {
    type: String,
    default: '',
    maxLength: 400,
  },
  // Base64 or URL for profile image
  profileImage: {
    type: String,
    default: ''
  },
  // Base64 or URL for profile banner image
  bannerImage: {
    type: String,
    default: ''
  },
  otp: { 
    type: String 
  }, // store OTP temporarily

  otpExpires: {
    type: Date,
  },
  isVerified: {
    type: Boolean,
    default: false
  }
  ,
  // Email change flow
  pendingEmail: {
    type: String,
    lowercase: true
  },
  emailChangeOtp: {
    type: String
  },
  emailChangeOtpExpires: {
    type: Date
  },
  
  // Admin blocking functionality
  isBlocked: {
    type: Boolean,
    default: false
  },
  blockReason: {
    type: String,
    default: null
  },
  blockedAt: {
    type: Date,
    default: null
  },
  blockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
  
}, { timestamps: true })

userSchema.pre("save", async function (next) {
  if(!this.isModified("password")) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } 
  catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

module.exports = mongoose.model('User', userSchema);user.model.js
