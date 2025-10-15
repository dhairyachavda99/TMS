import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, TrendingUp, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';

const ITStaffAnalytics = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [itStaffList, setItStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('all');

  useEffect(() => {
    fetchCurrentUser();
    fetchITStaffList();
    fetchITStaffStats();
  }, []);

  useEffect(() => {
    if (selectedStaff) {
      fetchITStaffStats();
    }
  }, [selectedStaff]);

  const fetchITStaffList = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tickets/it-staff', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.success) {
        setItStaffList(data.data.itStaff.filter(staff => staff.role === 'it_staff'));
      }
    } catch (err) {
      console.error('Failed to fetch IT staff list:', err);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.success) {
        setCurrentUser(data.data.user);
      }
    } catch (err) {
      console.error('Failed to fetch current user:', err);
    }
  };

  const fetchITStaffStats = async () => {
    try {
      setLoading(true);
      const url = selectedStaff && selectedStaff !== 'all' 
        ? `http://localhost:5000/api/tickets/stats/it-staff?staffId=${selectedStaff}`
        : 'http://localhost:5000/api/tickets/stats/it-staff';
      
      const response = await fetch(url, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.data.stats);
      } else {
        setError(data.message || 'Failed to fetch IT staff statistics');
      }
    } catch (err) {
      setError('Failed to fetch IT staff statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const COLORS = ['#10B981', '#3B82F6', '#EF4444', '#F59E0B'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading IT staff analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center max-w-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleGoBack}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Group data by month for charts
  const monthlyData = stats.reduce((acc, stat) => {
    const existing = acc.find(item => item.month === stat.month);
    if (existing) {
      existing.accepted += stat.accepted;
      existing.completed += stat.completed;
      existing.rejected += stat.rejected;
      existing.open += stat.open;
    } else {
      acc.push({
        month: stat.month,
        accepted: stat.accepted,
        completed: stat.completed,
        rejected: stat.rejected,
        open: stat.open
      });
    }
    return acc;
  }, []);

  const totalStats = stats.reduce((acc, stat) => ({
    accepted: acc.accepted + stat.accepted,
    completed: acc.completed + stat.completed,
    rejected: acc.rejected + stat.rejected,
    open: acc.open + stat.open
  }), { accepted: 0, completed: 0, rejected: 0, open: 0 });

  const pieData = [
    { name: 'Completed', value: totalStats.completed, color: '#10B981' },
    { name: 'Open', value: totalStats.open, color: '#3B82F6' },
    { name: 'Rejected', value: totalStats.rejected, color: '#EF4444' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-full px-6 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">IT Staff Analytics</h1>
              <p className="text-gray-600">
                {currentUser?.role === 'admin' 
                  ? 'Performance overview of IT staff members' 
                  : 'Your ticket handling performance'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {currentUser?.role === 'admin' && (
                <select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All IT Staff</option>
                  {itStaffList.map((staff) => (
                    <option key={staff._id} value={staff._id}>
                      {staff.username}
                    </option>
                  ))}
                </select>
              )}
              <button
                onClick={handleGoBack}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        {stats.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-500">No IT staff ticket data found.</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{totalStats.completed}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Open Tickets</p>
                    <p className="text-2xl font-bold text-gray-900">{totalStats.open}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Rejected</p>
                    <p className="text-2xl font-bold text-gray-900">{totalStats.rejected}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Accepted</p>
                    <p className="text-2xl font-bold text-gray-900">{totalStats.accepted}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Bar Chart */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" fill="#10B981" name="Completed" />
                    <Bar dataKey="open" fill="#3B82F6" name="Open" />
                    <Bar dataKey="rejected" fill="#EF4444" name="Rejected" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Detailed Statistics</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Month
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IT Staff
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Accepted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Completed
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Open
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rejected
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.map((stat, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{stat.month}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{stat.staffName}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{stat.accepted}</td>
                        <td className="px-6 py-4 text-sm text-green-600 font-medium">{stat.completed}</td>
                        <td className="px-6 py-4 text-sm text-blue-600 font-medium">{stat.open}</td>
                        <td className="px-6 py-4 text-sm text-red-600 font-medium">{stat.rejected}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{stat.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ITStaffAnalytics;