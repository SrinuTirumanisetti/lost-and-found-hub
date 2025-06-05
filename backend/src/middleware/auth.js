import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    // Find the user by ID and check if the token is in their tokens array
    const user = await User.findOne({ _id: decoded.user.id, 'tokens.token': token }).select('-password -tokens'); // Exclude password and tokens

     if (!user) {
         throw new Error();
     }

    req.token = token;
    req.user = user; // Attach the full user object (excluding sensitive data) to the request
    next();
  } catch (error) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

export default auth; 