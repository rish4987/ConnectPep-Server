const express = require('express');

const User = require('./models/user');
const connectDB = require('./config/database');
const dotenv = require('dotenv');
const cors = require('cors');


const cookieParser = require('cookie-parser');
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const requestRouter = require('./routes/requests');
const userRouter = require('./routes/userRouter');

const app = express();
app.use(express.json());
app.use(cookieParser());
dotenv.config();
app.use(cors({
  origin: ['http://16.171.199.229', 'http://localhost:5173'], 
  credentials: true
}));
 
const JWT_SECRET = process.env.JWT_SECRET || 'Dev@tinder$12323'; 



app.use('/auth', authRouter);
app.use('/profile', profileRouter);
app.use('/requests', requestRouter);
app.use('/user',userRouter);





// Connect to MongoDB
connectDB();

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});