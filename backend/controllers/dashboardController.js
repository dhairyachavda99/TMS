const User = require('../models/User');

// Get welcome dashboard data
const getWelcomeData = async (req, res) => {
  try {
    const user = req.user;
    
    // Example: Get user's ticket count, recent activities, etc.
    // You can implement actual ticket counting logic when you add ticket models
    const dashboardData = {
      user: {
        name: user.username,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
        joinedDate: user.createdAt
      },
      stats: {
        totalTickets: 0, // Implement actual ticket counting logic
        openTickets: 0,
        resolvedTickets: 0,
        pendingTickets: 0
      },
      recentActivity: [
        {
          id: 1,
          action: 'Logged in to system',
          timestamp: new Date(),
          type: 'login'
        }
      ]
    };

    res.json({
      success: true,
      message: `Welcome back, ${user.username}!`,
      data: dashboardData
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const supportUsers = await User.countDocuments({ role: 'support' });
    const itStaffUsers = await User.countDocuments({ role: 'it_staff' }); // Added IT Staff count
    const regularUsers = await User.countDocuments({ role: 'user' });

    const stats = {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      roles: {
        admin: adminUsers,
        support: supportUsers,
        it_staff: itStaffUsers, // Added IT Staff to roles
        user: regularUsers
      }
    };

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get recent users (admin only)
const getRecentUsers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const users = await User.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('-password');

    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    console.error('Recent users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getWelcomeData,
  getUserStats,
  getRecentUsers
};