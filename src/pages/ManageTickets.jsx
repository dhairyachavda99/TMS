import { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Clock, User, Calendar, ArrowRight, RefreshCw } from 'lucide-react';

const ManageTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [itStaff, setItStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [forwardData, setForwardData] = useState({ assignToId: '', note: '' });
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [resolution, setResolution] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchTickets();
    fetchITStaff();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/tickets', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setTickets(data.data.tickets || []);
      } else {
        setError(data.message || 'Failed to fetch tickets');
      }
    } catch (err) {
      setError('Unable to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchITStaff = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/tickets/it-staff', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setItStaff(data.data.itStaff || []);
      }
    } catch (err) {
      console.error('Failed to fetch IT staff:', err);
    }
  };

  const handleAccept = async (ticketId) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/tickets/${ticketId}/accept`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        fetchTickets();
        setError('');
      } else {
        setError(data.message || 'Failed to accept ticket');
      }
    } catch (err) {
      setError('Failed to accept ticket');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (ticketId) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/tickets/${ticketId}/reject`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectReason })
      });

      const data = await response.json();
      if (data.success) {
        fetchTickets();
        setRejectReason('');
        setError('');
      } else {
        setError(data.message || 'Failed to reject ticket');
      }
    } catch (err) {
      setError('Failed to reject ticket');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/tickets/${selectedTicket._id}/complete`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ resolution })
      });

      const data = await response.json();
      if (data.success) {
        fetchTickets();
        setShowCompleteModal(false);
        setResolution('');
        setSelectedTicket(null);
        setError('');
      } else {
        setError(data.message || 'Failed to complete ticket');
      }
    } catch (err) {
      setError('Failed to complete ticket');
    } finally {
      setActionLoading(false);
    }
  };

  const handleForward = async () => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/tickets/${selectedTicket._id}/forward`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(forwardData)
      });

      const data = await response.json();
      if (data.success) {
        fetchTickets();
        setShowForwardModal(false);
        setForwardData({ assignToId: '', note: '' });
        setSelectedTicket(null);
        setError('');
      } else {
        setError(data.message || 'Failed to forward ticket');
      }
    } catch (err) {
      setError('Failed to forward ticket');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticketNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-orange-500" />;
      case 'open': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'closed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-full px-6 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Manage Tickets</h1>
            <button 
              onClick={fetchTickets}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="rejected">Rejected</option>
            </select>

            <div className="flex items-center justify-end">
              <span className="text-sm text-gray-600">
                {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''} found
              </span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Tickets Grid */}
        <div className="grid gap-6">
          {filteredTickets.map((ticket) => (
            <div key={ticket._id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {ticket.ticketNumber}
                    </h3>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(ticket.status)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-2">{ticket.title}</p>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{ticket.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <span className="ml-1 font-medium">{ticket.type}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Room:</span>
                      <span className="ml-1 font-medium">{ticket.roomNo}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{ticket.raisedBy?.username}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{formatDate(ticket.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 ml-4">
                  {ticket.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAccept(ticket._id)}
                        disabled={actionLoading}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Reason for rejection (optional):');
                          if (reason !== null) {
                            setRejectReason(reason);
                            handleReject(ticket._id);
                          }
                        }}
                        disabled={actionLoading}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {ticket.status === 'open' && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setShowCompleteModal(true);
                        }}
                        disabled={actionLoading}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setShowForwardModal(true);
                        }}
                        disabled={actionLoading}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                      >
                        <ArrowRight className="w-3 h-3" />
                        Forward
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Complete Modal */}
        {showCompleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Complete Ticket</h3>
              <textarea
                placeholder="Resolution details..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="4"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleComplete}
                  disabled={actionLoading || !resolution.trim()}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  Complete
                </button>
                <button
                  onClick={() => {
                    setShowCompleteModal(false);
                    setResolution('');
                    setSelectedTicket(null);
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Forward Modal */}
        {showForwardModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Forward Ticket</h3>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                value={forwardData.assignToId}
                onChange={(e) => setForwardData({...forwardData, assignToId: e.target.value})}
              >
                <option value="">Select IT Staff</option>
                {itStaff.map((staff) => (
                  <option key={staff._id} value={staff._id}>
                    {staff.username} ({staff.role})
                  </option>
                ))}
              </select>
              <textarea
                placeholder="Note (optional)..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                value={forwardData.note}
                onChange={(e) => setForwardData({...forwardData, note: e.target.value})}
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleForward}
                  disabled={actionLoading || !forwardData.assignToId}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Forward
                </button>
                <button
                  onClick={() => {
                    setShowForwardModal(false);
                    setForwardData({ assignToId: '', note: '' });
                    setSelectedTicket(null);
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageTickets;