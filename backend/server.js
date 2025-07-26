import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/auth.js';
import userRoutes from './src/routes/user.js';
import adminRoutes from './src/routes/admin.js';
import itemRoutes from './src/routes/items.js';
import User from './src/models/User.js'; // Import User model

dotenv.config();

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Seed admin user function
const seedAdminUser = async () => {
  try {
    const adminEmail = 'srinu.t22@iiits.in';
    const adminUserExists = await User.findOne({ email: adminEmail });

    if (!adminUserExists) {
      const adminUser = new User({
        name: 'T Srinu',
        email: adminEmail,
        phoneNumber: '7207808960',
        password: 'Pavan@14112002', // The pre-save hook will hash this
        role: 'admin',
      });

      await adminUser.save();
      console.log('Default admin user created.');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};

// Connect to database and seed admin
connectDB().then(() => {
  seedAdminUser();
}).catch(err => {
  console.error('Database connection failed', err);
  process.exit(1);
});

const app = express();

// Configure CORS with specific options
const corsOptions = {
  origin: [
    'https://lost-and-found-hub-hrk7.vercel.app',
    'http://localhost:3000' // Keep local development support
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

// Apply CORS with the specified options
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/items', itemRoutes);

app.get('/', (req, res) => {
  res.send('Lost and Found Portal Backend API');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 