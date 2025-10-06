import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  User,
  LogOut,
  Ticket,
  CheckCircle,
  Clock,
  AlertTriangle,
  Activity,
  Settings,
  Bell
} from 'lucide-react';

export default function WelcomePage() {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWelcomeData();
  }, []);

  const graphData = {
    ticketsByStatus: [
      {name: 'Total Tickets', count: 100, fill: '#6E00B3'},
      {name: 'Open Tickets', count: 80, fill: 'blue'},
      {name: 'Resolved Tickets', count: 60, fill: '#0da11aff'},
      {name: 'Pending Tickets', count: 20, fill: '#ff0000ff'}
    ]
  }

  const fetchWelcomeData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/dashboard/welcome', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.data.user);
        setDashboardData(data.data);
      } else {
        setError(data.message || 'Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setError('Network error. Please check if the server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        localStorage.removeItem('user');
        alert('Logged out successfully!');
        // In a real app, redirect to login page
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('Error during logout');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'support':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'user':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'it_staff':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'it_staff':
        return 'IT STAFF';
      default:
        return role?.toUpperCase();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full" style={{ backgroundColor: '#272757' }}>
                <Ticket className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Ticket Management Dashboard</h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              <div className="flex items-center gap-3 border-l pl-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100">
                  <User className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{user?.name}</p>
                  <p className="text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="h-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="rounded-2xl p-6 text-white" style={{ backgroundColor: '#272757' }}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  Welcome back, {user?.name}!
                </h2>
                <p className="text-purple-100 mb-4">
                  {user?.role === 'it_staff' 
                    ? "Manage and resolve tickets efficiently" 
                    : "Here's what's happening with your tickets today"
                  }
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className={`px-3 py-1 rounded-full border ${getRoleColor(user?.role)} bg-white`}>
                    {getRoleDisplayName(user?.role)}
                  </span>
                  <span className="text-purple-100">
                    Last login: {formatDate(user?.lastLogin)}
                  </span>
                </div>
              </div>
              <div className="hidden md:block">
                {/* <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
                  <Activity className="w-12 h-12 text-white" />
                </div> */}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Tickets</p>
                <p className="text-3xl font-bold text-purple-600">
                  {dashboardData?.stats?.totalTickets || 100}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Ticket className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Open Tickets</p>
                <p className="text-3xl font-bold text-blue-600">
                  {dashboardData?.stats?.openTickets || 100}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Resolved</p>
                <p className="text-3xl font-bold text-green-600">
                  {dashboardData?.stats?.resolvedTickets || 90}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-red-600">
                  {dashboardData?.stats?.pendingTickets || 10}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl shadow-sm border p-6">
            <section className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Tickets by Status</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={graphData.ticketsByStatus}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="name" className="text-sm text-gray-600" />
                  <YAxis className="text-sm text-gray-600" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px', padding: '10px' }}
                    labelStyle={{ color: '#333', fontWeight: 'bold' }}
                    itemStyle={{ color: '#555' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="count" fill="#8884d8" name="Number of Tickets" />
                </BarChart>
              </ResponsiveContainer>
            </section>
          </div>

          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {user?.role !== 'it_staff' && (
                  <button onClick={() => window.location.href = 'welcome/generate'} className="w-full p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <Ticket className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium">Create New Ticket</span>
                    </div>
                  </button>
                )}
                
                <button onClick={() => {user?.role === 'it_staff' ? window.location.href = '/welcome/ManageTickets' : window.location.href = 'welcome/ViewTickets'} } className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium">
                      {user?.role === 'it_staff' ? 'Manage All Tickets' : 'View All Tickets'}
                    </span>
                  </div>
                </button>
                
                {(user?.role === 'admin') && (
                  <button onClick={() => window.location.href = 'welcome/SystemSettings'} className="w-full p-3 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-orange-600" />
                      <span className="text-sm font-medium">System Settings</span>
                    </div>
                  </button>
                )}
                
                <button onClick={() => window.location.href = 'welcome/UpdateProfile'} className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium">Profile Settings</span>
                  </div>
                </button>
              </div>
            </div>

            {/* User Info */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Username:</span>
                  <span className="font-medium">{user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-medium">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Role:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(user?.role)}`}>
                    {getRoleDisplayName(user?.role)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Login:</span>
                  <span className="font-medium text-xs">{formatDate(user?.lastLogin)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}