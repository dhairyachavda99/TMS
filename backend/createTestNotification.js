const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ticketmanagement');

const Notification = require('./models/Notification');
const User = require('./models/User');
const Ticket = require('./models/Tickets');

async function createTestNotification() {
  try {
    const itStaff = await User.find({ role: 'it_staff' });
    const ticket = await Ticket.findOne();
    
    if (itStaff.length < 2 || !ticket) {
      console.log('Need IT staff and ticket');
      return;
    }

    const notification = new Notification({
      recipient: itStaff[0]._id,
      sender: itStaff[1]._id,
      type: 'ticket_forwarded',
      title: 'Test Notification',
      message: `Test ticket forwarded to you`,
      ticketId: ticket._id
    });

    await notification.save();
    console.log('Test notification created:', notification._id);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestNotification();