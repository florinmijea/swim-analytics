import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Swimmer from './models/Swimmer';
import Club from './models/Club';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/swim-analytics';

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// API Routes
app.get('/api/swimmers', async (req, res) => {
  try {
    const swimmers = await Swimmer.find().populate('club');
    res.json(swimmers);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching swimmers' });
  }
});

app.get('/api/swimmers/:id', async (req, res) => {
  try {
    const swimmer = await Swimmer.findOne({ lpinId: req.params.id }).populate('club');
    if (!swimmer) {
      return res.status(404).json({ error: 'Swimmer not found' });
    }
    res.json(swimmer);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching swimmer' });
  }
});

app.get('/api/clubs', async (req, res) => {
  try {
    const clubs = await Club.find().populate('swimmers');
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching clubs' });
  }
});

app.get('/api/clubs/:id', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id).populate('swimmers');
    if (!club) {
      return res.status(404).json({ error: 'Club not found' });
    }
    res.json(club);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching club' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
