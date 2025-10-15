const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ticketmanagement');

async function createTestNotification() {
  try {
    // Find a user to send notification to
    const user = await User.findOne({ username: 'admin' });
    if (!user) {
      console.log('No admin user found');
      return;
    }

    // Create test notification
    const notification = new Notification({
      recipient: user._id,
      sender: user._id,
      type: 'ticket_assigned',
      title: 'Test Notification',
      message: 'This is a test notification to verify the system works',
      ticketId: new mongoose.Types.ObjectId()
    });

    await notification.save();
    console.log('Test notification created successfully');
    
    // Check if notification exists
    const notifications = await Notification.find({ recipient: user._id });
    console.log(`Found ${notifications.length} notifications for user`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestNotification();