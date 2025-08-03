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
app.use(cors(
  {
    origin:'https://connectpep.onrender.com',
    credentials: true
  }
))
 
const JWT_SECRET = process.env.JWT_SECRET || 'Dev@tinder$12323'; 
const PORT = process.env.PORT || 10000;


app.use('/auth', authRouter);
app.use('/profile', profileRouter);
app.use('/requests', requestRouter);
app.use('/user',userRouter)






// Connect to MongoDB
connectDB();

// Start the server
app.listen(PORT, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
