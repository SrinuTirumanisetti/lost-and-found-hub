import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Register User
router.post('/register', async (req, res) => {
  try {
    // Ensure required fields sent by frontend are present
    const { name, email, phoneNumber, password } = req.body;
    if (!name || !email || !phoneNumber || !password) {
        return res.status(400).json({ message: 'Please enter all required fields: name, email, phone number, and password' });
    }

    // Check if user already exists by email
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    // Check if user already exists by phone number
    user = await User.findOne({ phoneNumber });
    if (user) {
      return res.status(400).json({ message: 'A user with this phone number already exists.' });
    }

    // Create new user instance (password hashing is done in pre-save hook)
    user = new User({
      name,
      email,
      phoneNumber,
      password,
      role: 'user' // Default role is user
    });

    // Save user to database
    await user.save();

    // Generate token and send response (optional, could just ask user to login)
    // const token = await user.generateAuthToken();
    // res.status(201).json({ user, token });

    res.status(201).json({ message: 'User registered successfully. Please login.' });

  } catch (error) {
    console.error('Registration Error:', error);
    // Mongoose validation errors will be caught here. We can check for them specifically.
    if (error.name === 'ValidationError') {
       const messages = Object.values(error.errors).map(val => val.message);
       return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login User
router.post('/login', async (req, res) => {
  const startTime = Date.now();
  console.log('Login request received for email:', req.body.email);
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('Login failed: Missing email or password');
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    console.log('Looking up user in database...');
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('Login failed: User not found');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('User found, verifying password...');
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log('Login failed: Invalid password');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('Password verified, generating token...');
    const token = await user.generateAuthToken();
    
    // Remove password from response
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    
    console.log('Login successful, returning response');
    console.log('Total login time:', Date.now() - startTime, 'ms');
    
    res.json({ 
      user: userObject, 
      token 
    });

  } catch (error) {
    console.error('Login Error after', Date.now() - startTime, 'ms:', error);
    res.status(500).json({ 
      message: 'An error occurred during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Verify Token (Protected Route Example)
// This route can be used by the frontend to check if a token is still valid
router.get('/verify', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token and find the user who owns it
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const user = await User.findOne({ _id: decoded.user.id, 'tokens.token': token });

    if (!user) {
      throw new Error();
    }

    // Send back the user object (excluding password and tokens)
    res.json({ user });

  } catch (error) {
    console.error('Token Verification Error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
});

// Logout User (Protected Route Example)
router.post('/logout', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
     const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
     const user = await User.findById(decoded.user.id);

     if (!user) {
         throw new Error();
     }

    // Remove the current token from the user's tokens array
    user.tokens = user.tokens.filter((t) => t.token !== token);
    await user.save();

    res.json({ message: 'Logged out successfully' });

  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 