const express = require('express');
require('dotenv').config();
const app = express();
const {authRouter} = require('./routes/auth');
const {projectRouter} = require('./routes/project');
const {taskRouter} = require('./routes/task');
const {connectDB} = require('./config/db');

//Connect to Database
connectDB();

app.use(express.json());
app.use('/api/v1',authRouter);
app.use('/api/v1',projectRouter);
app.use('/api/v1',taskRouter);

app.listen(3000, () =>{
    console.log('Server is running on port 3000');
});
