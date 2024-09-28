const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const commentsRoutes = require('./routes/comments');
const path = require('path');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());  // Parse incoming JSON requests
app.use(cors());   

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
