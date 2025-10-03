import React, { useState } from 'react';
import { User, Lock, Save, AlertCircle, CheckCircle } from 'lucide-react';

// router.route('/').put(protect, updateProfile);

const ProfileUpdateForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
    // Get token from localStorage or wherever you store it
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    const response = await fetch('http://localhost:5000/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        username: formData.username,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      })
    });

    const result = await response.json();

    if (response.ok) {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setFormData({ username: '', password: '', confirmPassword: '' });
      
      // Optional: Update user data in your app state/localStorage
      if (result.user) {
        localStorage.setItem('user', JSON.stringify(result.user));
      }
    } else {
      // Handle server-side errors
      if (result.errors) {
        // Set field-specific errors from server
        setErrors(result.errors);
        setMessage({ type: 'error', text: result.message || 'Please fix the errors below' });
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to update profile' });
      }
    }
    console.log('Form submitted');
    console.log('Token:', token);
    console.log('Form data:', formData)
  } catch (error) {
    console.error('Network or client-side error:', error);
    setMessage({ type: 'error', text: 'Network error. Please check your connection and try again.' });
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 rounded-full mb-6" style={{ backgroundColor: '#272757' }}>
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-light text-gray-800 mb-2">Update Profile</h1>
          <p className="text-gray-500">Modify your account credentials</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-100">
            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-3">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white transition-all duration-200 ${
                      errors.username ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-blue-400'
                    }`}
                    placeholder="Enter username"
                  />
                  <User className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                    errors.username ? 'text-red-400' : 'text-gray-400'
                  }`} />
                </div>
                {errors.username && (
                  <p className="mt-3 text-sm text-red-500 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-3">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white transition-all duration-200 ${
                      errors.password ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-blue-400'
                    }`}
                    placeholder="Enter new password"
                  />
                  <Lock className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                    errors.password ? 'text-red-400' : 'text-gray-400'
                  }`} />
                </div>
                {errors.password && (
                  <p className="mt-3 text-sm text-red-500 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-3">
                  Confirm Password
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
                  <p className="mt-3 text-sm text-red-500 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Message Display */}
              {message.text && (
                <div className={`p-4 rounded-lg border-l-4 ${
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
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full text-white py-4 px-6 rounded-lg font-medium hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
                style={{ backgroundColor: '#272757' }}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-3" />
                    Update Profile
                  </>
                )}
              </button>
              </form>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-400">
              Ensure your password is strong and secure
            </p>
          </div>
        </div>
      </div>
  );
};

export default ProfileUpdateForm;