import { useState } from 'react';
import axios from "axios";
import { Ticket, Send, User, Home, AlertCircle, CheckCircle } from 'lucide-react';

export default function TicketGenerator() {
  const [formData, setFormData] = useState({
    ticketType: '',
    complaint: '',
    roomNo: '',
    raisedFor: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitted, setisSubmitted] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.ticketType) {
      newErrors.ticketType = 'Please select a ticket type';
    }

    if (!formData.complaint.trim()) {
      newErrors.complaint = 'Please describe your complaint';
    }

    if (!formData.roomNo.trim()) {
      newErrors.roomNo = 'Please enter your room number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setisSubmitted(true);
      try {
        const response=await axios.post("http://localhost:5000/api/tickets/generate", {
          ticketType: formData.ticketType,
          complaint: formData.complaint,
          roomNo: formData.roomNo,
          raisedFor: formData.raisedFor
        }, { withCredentials: true }
          ,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true, // include cookies/session if using JWT auth
          }
        );

        if (response.data.success) {
          console.log("Ticket created:", response.data.data.ticket);
        }
      } catch (error) {
        console.error("Error creating ticket:", error);
        setErrors({ general: "Failed to create ticket. Try again." });
      }

      // Reset form after 3 sec
      setTimeout(() => {
      //   setisSubmitted(false);
      //   // setFormData({
      //   //   ticketType: "",
      //   //   complaint: "",
      //   //   roomNo: "",
      //   //   raisedFor: "",
      //   // });
        window.location.href = '/welcome';
      }, 3000);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-gray-100">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ticket Generated!</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">Your support ticket has been successfully created and assigned to our team.</p>
          <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
            <div className="bg-green-500 h-1 rounded-full animate-pulse w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {/* <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#272757' }}>
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Generate Ticket</h1>
            </div>
          </div>
        </div>
      </div> */}

      {/* Form Container */}
      <div className="h-full flex items-center justify-center px-6 py-12">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden max-w-2xl w-full">
          <div className="p-8 border-b border-gray-100" style={{ backgroundColor: '#272757' }}>
            <h2 className="text-xl font-semibold text-white">Create New Ticket</h2>
            <p className="text-white/80 mt-1">Fill out the form below to generate your support ticket</p>
          </div>

          <div className="p-8 space-y-8">
            {/* Ticket Type */}
            <div className="space-y-4">
              <label className="block text-gray-900 font-semibold text-lg flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#272757' }}>
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
                Type of Ticket
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="ticketType"
                    value="incidental"
                    checked={formData.ticketType === 'incidental'}
                    onChange={(e) => handleInputChange('ticketType', e.target.value)}
                    className="sr-only"
                  />
                  <div className={`p-6 rounded-2xl border-2 transition-all duration-200 text-center ${formData.ticketType === 'incidental'
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}>
                    <div className="font-semibold text-gray-900">Incidental</div>
                    <div className="text-sm text-gray-600 mt-1">One-time issue</div>
                  </div>
                </label>
                <label className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="ticketType"
                    value="replacement"
                    checked={formData.ticketType === 'replacement'}
                    onChange={(e) => handleInputChange('ticketType', e.target.value)}
                    className="sr-only"
                  />
                  <div className={`p-6 rounded-2xl border-2 transition-all duration-200 text-center ${formData.ticketType === 'replacement'
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}>
                    <div className="font-semibold text-gray-900">Replacement</div>
                    <div className="text-sm text-gray-600 mt-1">Item replacement</div>
                  </div>
                </label>
              </div>
              {errors.ticketType && (
                <p className="text-red-500 text-sm flex items-center gap-2 mt-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.ticketType}
                </p>
              )}
            </div>

            {/* Complaint */}
            <div className="space-y-4">
              <label htmlFor="complaint" className="block text-gray-900 font-semibold text-lg">
                Complaint Description
              </label>
              <textarea
                id="complaint"
                value={formData.complaint}
                onChange={(e) => handleInputChange('complaint', e.target.value)}
                placeholder="Please provide a detailed description of your issue..."
                rows={5}
                className={`w-full px-6 py-4 bg-gray-50 border-2 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 resize-none ${errors.complaint ? 'border-red-500' : 'border-gray-200'
                  }`}
              />
              {errors.complaint && (
                <p className="text-red-500 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.complaint}
                </p>
              )}
            </div>

            {/* Room Number */}
            <div className="space-y-4">
              <label htmlFor="roomNo" className="block text-gray-900 font-semibold text-lg flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#0F0E47' }}>
                  <Home className="w-4 h-4 text-white" />
                </div>
                Room Number
              </label>
              <input
                type="number"
                id="roomNo"
                value={formData.roomNo}
                onChange={(e) => handleInputChange('roomNo', e.target.value)}
                placeholder="e.g., 101, 202, 305"
                className={`w-full px-6 py-4 bg-gray-50 border-2 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 ${errors.roomNo ? 'border-red-500' : 'border-gray-200'
                  }`}
              />
              {errors.roomNo && (
                <p className="text-red-500 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.roomNo}
                </p>
              )}
            </div>

            {/* Raised For (Optional) */}
            <div className="space-y-4">
              <label htmlFor="raisedFor" className="block text-gray-900 font-semibold text-lg flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#0F0E47' }}>
                  <User className="w-4 h-4 text-white" />
                </div>
                Raised For
                <span className="text-gray-500 text-sm font-normal">(Optional)</span>
              </label>
              <select
                id="raisedFor"
                value={formData.raisedFor}
                onChange={(e) => handleInputChange('raisedFor', e.target.value)}
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl text-white focus:outline-none focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer"
                style={{
                  backgroundColor: '#0F0E47',
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1.5rem center',
                  backgroundSize: '1rem'
                }}
              >
                <option value="">Select person (or leave blank for yourself)</option>
                <option value="Hetal mam">Hetal mam</option>
                <option value="Asmita mam">Asmita mam</option>
                <option value="Khushal sir">Khushal sir</option>
                <option value="Shaunak sir">Shaunak sir</option>
                <option value="Savan sir">Savan sir</option>
                <option value="Imran sir">Imran sir</option>
                <option value="Yash sir">Yash sir</option>
                <option value="Devki mam">Devki mam</option>
                <option value="Rachel mam">Rachel mam</option>
                <option value="Daya mam">Daya mam</option>
                <option value="Reetu mam">Reetu mam</option>
                <option value="Smita mam">Smita mam</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                onClick={handleSubmit}
                className="w-full py-4 px-6 text-white font-semibold rounded-2xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-lg"
                style={{ backgroundColor: '#272757' }}
              >
                <Send className="w-5 h-5" />
                Generate Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
