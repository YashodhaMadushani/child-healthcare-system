import React, { useState } from 'react';
import { IoEye, IoEyeOff } from 'react-icons/io5';
import axios from 'axios';

const AddStaffModal = ({ isOpen, onClose, refreshData }) => {
  const initialFormData = {
    name: '',
    role: 'Doctor',
    clinic: '',
    email: '', 
    password: '',
    phone: '',
    gender: 'Male',
    age: '',
    slmcRegNo: '',
    nicNo: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [passwordVisible, setPasswordVisible] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register-staff', formData);
      alert("Staff member registered successfully.");
      setFormData(initialFormData);
      refreshData();
      onClose();
    } catch (err) {
      console.error("Registration Error:", err.response?.data?.msg || err.message);
      alert(err.response?.data?.msg || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all my-8">
        
        {/* Modal Header */}
        <div className="bg-slate-50 px-8 py-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Add New Staff</h2>
            <p className="text-sm text-slate-500 font-medium">Create a new healthcare provider account</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl font-light">×</button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">Full Name *</label>
            <input 
              type="text" 
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
              placeholder="e.g. Dr. Sarah Johnson"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">Role *</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm cursor-pointer"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="Doctor">Doctor</option>
                <option value="Midwife">Midwife</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">Assigned Clinic *</label>
              <input 
                type="text" 
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="Clinic Location"
                value={formData.clinic}
                onChange={(e) => setFormData({...formData, clinic: e.target.value})}
              />
            </div>
          </div>

          {/* Gender & Age */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">Gender</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm cursor-pointer"
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">Age</label>
              <input 
                type="number" 
                min="18"
                max="100"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="e.g. 35"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">Phone Number</label>
            <input 
              type="text" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              placeholder="e.g. 0771234567"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          {/* Identification Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">NIC Number</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="e.g. 199012345678"
                value={formData.nicNo}
                onChange={(e) => setFormData({...formData, nicNo: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">SLMC Reg. No</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="e.g. SLMC-45892"
                value={formData.slmcRegNo}
                onChange={(e) => setFormData({...formData, slmcRegNo: e.target.value})}
              />
            </div>
          </div>

          {/* Login Credentials */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Login Credentials *</label>
            <div className="space-y-3">
              <input 
                type="email" 
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <div style={{ position: 'relative' }}>
                <input 
                  type={passwordVisible ? 'text' : 'password'}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="Password (min 6 characters)"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  style={{ paddingRight: 40 }}
                />
                <span
                  onClick={() => setPasswordVisible(v => !v)}
                  style={{ position: 'absolute', right: 15, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#888', fontSize: 20 }}
                  tabIndex={0}
                  aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                >
                  {passwordVisible ? <IoEyeOff /> : <IoEye />}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all text-sm"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all text-sm"
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