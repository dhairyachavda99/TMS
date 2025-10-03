const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ticketmanagement', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// User Schema with updated role enum
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
    enum: ['admin', 'user', 'support', 'it_staff'],
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

// Migration function to add IT staff users
const migrateToITStaffRole = async () => {
  try {
    console.log('🔄 Starting migration to add IT Staff role...');

    await connectDB();

    // Check if IT staff users already exist
    const existingITStaff = await User.countDocuments({ role: 'it_staff' });
    
    if (existingITStaff > 0) {
      console.log(`✅ Found ${existingITStaff} existing IT Staff users. Migration may have already been run.`);
    }

    // Create sample IT Staff users if they don't exist
    const itStaffUsers = [
      {
        username: 'it_manager',
        email: 'itmanager@ticketmanagement.com',
        password: 'itstaff123',
        role: 'it_staff'
      },
      {
        username: 'tech_specialist',
        email: 'techspecialist@ticketmanagement.com',
        password: 'itstaff123',
        role: 'it_staff'
      }
    ];

    for (const userData of itStaffUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({
          $or: [
            { username: userData.username },
            { email: userData.email }
          ]
        });

        if (existingUser) {
          console.log(`⚠️  User ${userData.username} already exists. Skipping...`);
          continue;
        }

        // Create new IT staff user
        const user = new User(userData);
        await user.save();
        console.log(`✅ Created IT Staff user: ${userData.username}`);
      } catch (error) {
        console.error(`❌ Error creating user ${userData.username}:`, error.message);
      }
    }

    // Display current user statistics
    const stats = {
      total: await User.countDocuments(),
      admin: await User.countDocuments({ role: 'admin' }),
      support: await User.countDocuments({ role: 'support' }),
      it_staff: await User.countDocuments({ role: 'it_staff' }),
      user: await User.countDocuments({ role: 'user' })
    };

    console.log('\n📊 Current User Statistics:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total Users: ${stats.total}`);
    console.log(`Administrators: ${stats.admin}`);
    console.log(`Support Staff: ${stats.support}`);
    console.log(`IT Staff: ${stats.it_staff}`);
    console.log(`Regular Users: ${stats.user}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log('\n🔐 IT Staff Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Username: it_manager     | Password: itstaff123  | Role: it_staff');
    console.log('Username: tech_specialist| Password: itstaff123  | Role: it_staff');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log('\n🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the migration
if (require.main === module) {
  migrateToITStaffRole();
}

module.exports = { migrateToITStaffRole };