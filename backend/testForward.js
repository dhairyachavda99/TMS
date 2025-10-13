const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ticketmanagement');

const Ticket = require('./models/Tickets');
const User = require('./models/User');
const Notification = require('./models/Notification');

async function testForward() {
  try {
    // Find an open ticket
    const ticket = await Ticket.findOne({ status: 'open' });
    if (!ticket) {
      console.log('No open ticket found');
      return;
    }

    // Find IT staff users
    const itStaff = await User.find({ role: 'it_staff' });
    console.log('IT Staff found:', itStaff.map(u => u.username));

    if (itStaff.length < 2) {
      console.log('Need at least 2 IT staff members to test forwarding');
      return;
    }

    const fromUser = itStaff[0];
    const toUser = itStaff[1];

    console.log(`Testing forward from ${fromUser.username} to ${toUser.username}`);
    console.log(`Ticket: ${ticket.ticketNumber} (${ticket.status})`);

    // Test the forward functionality
    ticket.assignedTo = toUser._id;
    ticket.history.push({
      status: ticket.status,
      note: `Ticket forwarded to ${toUser.username}`,
      updatedBy: fromUser._id
    });

    await ticket.save();

    // Create notification
    const notification = new Notification({
      recipient: toUser._id,
      sender: fromUser._id,
      type: 'ticket_forwarded',
      title: 'Ticket Forwarded to You',
      message: `Ticket ${ticket.ticketNumber} has been forwarded to you by ${fromUser.username}`,
      ticketId: ticket._id
    });
    await notification.save();

    console.log('Forward test completed successfully!');
    console.log('Notification created:', notification._id);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testForward();