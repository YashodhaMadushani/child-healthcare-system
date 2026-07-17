import React, { useState } from 'react';
import { IoEye, IoEyeOff } from 'react-icons/io5';
import axios from 'axios';

const AddStaffModal = ({ isOpen, onClose, refreshData }) => {

  const [formData, setFormData] = useState({
    name: '',
    role: 'Doctor',
    clinic: '',
    email: '', 
    password: ''
  });
  const [passwordVisible, setPasswordVisible] = useState(false);

  
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      
      await axios.post('http://localhost:5000/api/auth/register', formData);
      alert("Staff member registered successfully.");
      refreshData();
      onClose();
    } catch (err) {
      console.error("Registration Error:", err.response?.data?.msg || err.message);
      alert(err.response?.data?.msg || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        
        {/* Modal Header */}
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Add New Staff</h2>
            <p className="text-sm text-slate-500 font-medium">Create a new healthcare provider account</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl font-light">×</button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Full Name</label>
            <input 
              type="text" 
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="e.g. Dr. Sarah Johnson"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Role</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="Doctor">Doctor</option>
                <option value="Midwife">Midwife</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Assigned Clinic</label>
              <input 
                type="text" 
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Clinic Location"
                value={formData.clinic}
                onChange={(e) => setFormData({...formData, clinic: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-50 mt-4">
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Login Credentials</label>
            <div className="space-y-3">
              <input 
                type="email" 
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <div style={{ position: 'relative' }}>
                <input 
                  type={passwordVisible ? 'text' : 'password'}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  style={{ paddingRight: 40 }}
                />
                <span
                  onClick={() => setPasswordVisible(v => !v)}
                  style={{ position: 'absolute', right: 15, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#888', fontSize: 22 }}
                  tabIndex={0}
                  aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                >
                  {passwordVisible ? <IoEyeOff /> : <IoEye />}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
            >
              Save Staff
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStaffModal;