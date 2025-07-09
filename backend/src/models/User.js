import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Username: letters, digits, ., _, -, +; not start/end with dot, no consecutive dots
        // @ required once
        // Domain: at least one dot, letters/digits/hyphens, not start/end with dot/hyphen
        // TLD at least 2 chars
        return /^([a-zA-Z0-9_\-+]+(\.[a-zA-Z0-9_\-+]+)*)@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(v) &&
          !/^\./.test(v.split('@')[0]) &&
          !/\.$/.test(v.split('@')[0]) &&
          !/\.\./.test(v.split('@')[0]) &&
          !/^[-.]/.test(v.split('@')[1]) &&
          !/[-.]$/.test(v.split('@')[1]);
      },
      message: 'Email is not valid according to the required rules.'
    }
  },
  phoneNumber: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        // Only validate during registration (if this.isNew)
        if (!this.isNew) return true;
        if (!v) return false;
        return /^\d{10}$/.test(v);
      },
      message: 'Phone number should be a 10 digit Indian number.'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    trim: true,
    validate: {
      validator: function(v) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/.test(v);
      },
      message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  tokens: [{
    token: {
      type: String,
      required: true,
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash the plain text password before saving
userSchema.pre('save', async function(next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

// Generate an auth token
userSchema.methods.generateAuthToken = async function() {
  const user = this;
  const token = jwt.sign({ user: { id: user.id, role: user.role } }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });
  
  user.tokens = user.tokens.concat({ token });
  await user.save();
  
  return token;
};

// Find user by credentials (only for login, no full schema validation needed here)
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('Invalid email');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Invalid password');
  }

  return user;
};

// Hide sensitive data
userSchema.methods.toJSON = function() {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;

  return userObject;
};

const User = mongoose.model('User', userSchema);

export default User; 