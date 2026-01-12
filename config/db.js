const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log('MongoDB Connected Successfully');
        
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB Disconnected');
        });
        
        mongoose.connection.on('error', (error) => {
            console.error('MongoDB Connection Error:', error.message);
        });
        
    } catch (error) {
        console.error('MongoDB Connection Failed:', error.message);
        process.exit(1);
    }
};

module.exports = { connectDB };
