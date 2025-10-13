const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ticketmanagement');

const Ticket = require('./models/Tickets');
const User = require('./models/User');

async function createTestTicket() {
  try {
    // Find a regular user to create ticket for
    const user = await User.findOne({ role: 'user' });
    if (!user) {
      console.log('No user found');
      return;
    }

    const testTicket = new Ticket({
      title: 'Test Pending Ticket',
      description: 'This is a test ticket in pending status for IT staff to accept/reject',
      type: 'incidental',
      status: 'pending',
      roomNo: '101',
      raisedBy: user._id,
      history: [{
        status: 'pending',
        note: 'Test ticket created',
        updatedBy: user._id
      }]
    });

    await testTicket.save();
    console.log('Test ticket created:', testTicket.ticketNumber);
    
    // Show current tickets
    const tickets = await Ticket.find({}).populate('raisedBy', 'username role');
    console.log('\nCurrent tickets:');
    tickets.forEach(ticket => {
      console.log(`- ${ticket.ticketNumber}: ${ticket.status} (by ${ticket.raisedBy.username})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestTicket();