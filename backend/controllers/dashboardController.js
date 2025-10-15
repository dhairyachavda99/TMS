const User = require('../models/User');
const Ticket = require('../models/Tickets');

// Get welcome dashboard data
const getWelcomeData = async (req, res) => {
  try {
    const user = req.user;
    
    // Get role-specific ticket statistics
    let ticketQuery = {};
    
    if (user.role === 'user' || user.role === 'support') {
      // Users and support see only their own tickets
      ticketQuery = {
        $or: [
          { raisedBy: user._id },
          { raisedFor: user._id }
        ]
      };
    }
    // Admin and IT staff see all tickets (no query filter)

    const [totalTickets, openTickets, resolvedTickets, pendingTickets, rejectedTickets] = await Promise.all([
      Ticket.countDocuments(ticketQuery),
      Ticket.countDocuments({ ...ticketQuery, status: 'open' }),
      Ticket.countDocuments({ ...ticketQuery, status: 'resolved' }),
      Ticket.countDocuments({ ...ticketQuery, status: 'pending' }),
      Ticket.countDocuments({ ...ticketQuery, status: 'rejected' })
    ]);

    const dashboardData = {
      user: {
        name: user.username,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
        joinedDate: user.createdAt
      },
      stats: {
        totalTickets,
        openTickets,
        resolvedTickets,
        pendingTickets,
        rejectedTickets
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