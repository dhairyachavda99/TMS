const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ticketmanagement', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema (same as in server.js)
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'support', 'it_staff'], // Added it_staff role
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

// Sample users data - Added IT Staff users with strong passwords
const sampleUsers = [
  {
    username: 'admin',
    email: 'admin@ticketmanagement.com',
    password: 'Admin123!',
    role: 'admin'
  },
   {
    username: 'Hetal Savla',
    email: 'hetalsavla99@gmail.com',
    password: 'Hetal123!',
    role: 'admin'
  },
  {
    username: 'Asmita Zala',
    email: 'asmita2@gmail.com',
    password: 'Asmita123!',
    role: 'user'
  },
  {
    username: 'Shaunak Purohit',
    email: 'shaunak11@gmail.com',
    password: 'Shaunak123!',
    role: 'user'
  },
  {
    username: 'Khushal Rajani',
    email: 'khuushal44@gmail.com',
    password: 'Khushal123!',
    role: 'user'
  },
  {
    username: 'Sawan Sanghvi',
    email: 'savan77@gmail.com',
    password: 'Sawan123!',
    role: 'user'
  },
  {
    username: 'Imran Modi',
    email: 'imran66@gmail.com',
    password: 'Imran123!',
    role: 'user'
  },
  {
    username: 'Yash Kotecha',
    email: 'yash1@gmail.com',
    password: 'Yash123!',
    role: 'user'
  },
  {
    username: 'Devki Trivedi',
    email: 'devkit@gmail.com',
    password: 'Devki123!',
    role: 'user'
  },
  {
    username: 'Rachel Thannaraj',
    email: 'rachelstanley@gmail.com',
    password: 'Rachel123!',
    role: 'user'
  },
  {
    username: 'Daya Sidhdhapura',
    email: 'daya55@gmail.com',
    password: 'Daya123!',
    role: 'user'
  },
  {
    username: 'Reetu Tejwani',
    email: 'reetu00@gmail.com',
    password: 'Reetu123!',
    role: 'user'
  },
  {
    username: 'Smita Nayak',
    email: 'smita@gmail.com',
    password: 'Smita123!',
    role: 'user'
  },
  {
    username: 'support_user',
    email: 'support@ticketmanagement.com',
    password: 'Support123!',
    role: 'support'
  },
  {
    username: 'Vinit Haria',
    email: 'vinit33@gmail.com',
    password: 'Vinit123!',
    role: 'support'
  },
  {
    username: 'Siddharth Sheth',
    email: 'siddharth22@gmail.com',
    password: 'Siddharth123!',
    role: 'support'
  },
  {
    username: 'Priyanshi Sanghani',
    email: 'Priyanshi88@gmail.com',
    password: 'Priyanshi123!',
    role: 'support'
  },

  // New IT Staff users
  {
    username: 'it_manager',
    email: 'itmanager@ticketmanagement.com',
    password: 'ItManager123!',
    role: 'it_staff'
  },
  {
    username: 'tech_specialist',
    email: 'techspecialist@ticketmanagement.com',
    password: 'TechSpec123!',
    role: 'it_staff'
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing users
    await User.deleteMany({});
    console.log('✅ Cleared existing users');

    // Create sample users
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created user: ${userData.username} (${userData.role})`);
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n🔐 Sample login credentials (Strong Passwords):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Username: admin          | Password: Admin123!      | Role: admin');
    console.log('Username: Hetal Savla    | Password: Hetal123!      | Role: admin');
    console.log('Username: support_user   | Password: Support123!    | Role: support');
    console.log('Username: it_manager     | Password: ItManager123!  | Role: it_staff');
    console.log('Username: tech_specialist| Password: TechSpec123!   | Role: it_staff');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Note: All passwords now require: 8+ chars, uppercase, lowercase, number, special char');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the seeding function
seedDatabase();