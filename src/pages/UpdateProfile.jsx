import React, { useState, useEffect } from 'react';
import { Lock, Save, AlertCircle, CheckCircle, User, ArrowLeft } from 'lucide-react';

const UpdateProfile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setUser(data.data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: formData.newPassword,
          currentPassword: formData.currentPassword
        })
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Password updated successfully!' });
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to update password' });
      }
    } catch (error) {
      console.error('Password update error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-full px-6 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-gray-600">Manage your account security</p>
            </div>
            <button
              onClick={handleGoBack}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#272757' }}>
                <User className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {user?.username || 'Loading...'}
              </h3>
              <p className="text-sm text-gray-500 mb-3">{user?.email}</p>
              <span className="inline-block px-3 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: '#272757', color: 'white' }}>
                {user?.role?.toUpperCase()}
              </span>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Account Status:</span>
                    <span className="font-medium text-green-600">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Updated:</span>
                    <span className="font-medium text-gray-900">Today</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Password Update Form */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
                <p className="text-sm text-gray-500">Keep your account secure with a strong password</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Password */}
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white transition-all duration-200 ${
                      errors.currentPassword ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-blue-400'
                    }`}
                    placeholder="Enter current password"
                  />
                  <Lock className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                    errors.currentPassword ? 'text-red-400' : 'text-gray-400'
                  }`} />
                </div>
                {errors.currentPassword && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.currentPassword}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white transition-all duration-200 ${
                      errors.newPassword ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-blue-400'
                    }`}
                    placeholder="Enter new password"
                  />
                  <Lock className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                    errors.newPassword ? 'text-red-400' : 'text-gray-400'
                  }`} />
                </div>
                {errors.newPassword && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.newPassword}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  💡 Password must be at least 6 characters long and different from your current password
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white transition-all duration-200 ${
                      errors.confirmPassword ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-blue-400'
                    }`}
                    placeholder="Confirm new password"
                  />
                  <Lock className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                    errors.confirmPassword ? 'text-red-400' : 'text-gray-400'
                  }`} />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Message Display */}
              {message.text && (
                <div className={`p-4 rounded-xl border-l-4 shadow-sm ${
                  message.type === 'success' 
                    ? 'bg-green-50 border-green-400 text-green-700' 
                    : 'bg-red-50 border-red-400 text-red-700'
                }`}>
                  <div className="flex items-center">
                    {message.type === 'success' ? (
                      <CheckCircle className="w-5 h-5 mr-3" />
                    ) : (
                      <AlertCircle className="w-5 h-5 mr-3" />
                    )}
                    <span className="font-medium">{message.text}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-lg"
                  style={{ backgroundColor: '#272757' }}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Update Password
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;