import React, { useState, useRef } from 'react';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';
import { useReactToPrint } from 'react-to-print';
import './Modal.css';

const ChildRegistrationModal = ({ isOpen, onClose, refreshData }) => {
    const componentRef = useRef();
    const [formData, setFormData] = useState({
        childName: '',
        dob: '',
        gender: 'Male',
        birthWeight: '',
        birthHeight: '',
        motherName: '',
        phone: '',
        address: ''
    });

    const [registeredChild, setRegisteredChild] = useState(null);

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: registeredChild ? `QR_Card_${registeredChild.childId}` : 'QR_Card',
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    
    console.log("Submitting:", formData);

    try {
        const res = await axios.post('http://localhost:5000/api/children/register', {
            ...formData,
            birthWeight: Number(formData.birthWeight) || 0,
            birthHeight: Number(formData.birthHeight) || 0,
            registeredBy: "Staff Member" 
        });
        
        setRegisteredChild(res.data.child);
        alert("Child registered successfully!");
        if (refreshData) refreshData();
    } catch (err) {
        console.error("Error:", err.response?.data);
        alert("Error: " + (err.response?.data?.msg || "Registration failed. Please try again."));
    }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content registration-modal">
                {!registeredChild ? (
                    <>
                        <h3 className="modal-title">Start New Registration</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <input type="text" placeholder="Child's Full Name" required onChange={e => setFormData({...formData, childName: e.target.value})} />
                                <input type="date" required onChange={e => setFormData({...formData, dob: e.target.value})} />
                                <select onChange={e => setFormData({...formData, gender: e.target.value})}>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                                <input type="number" step="0.01" placeholder="Birth Weight (kg)" required onChange={e => setFormData({...formData, birthWeight: e.target.value})} />
                                <input type="number" step="0.1" placeholder="Birth Height (cm)" required onChange={e => setFormData({...formData, birthHeight: e.target.value})} />
                                <input type="text" placeholder="Mother's Name" required onChange={e => setFormData({...formData, motherName: e.target.value})} />
                                <input type="tel" placeholder="Phone Number" required onChange={e => setFormData({...formData, phone: e.target.value})} />
                                <textarea placeholder="Address" required onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                                <button type="submit" className="btn-primary">Register Child</button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="success-view">
                        <h3>Registration Successful! ✅</h3>
                        <div ref={componentRef} className="qr-card-to-print">
                            <div className="card-header-print">
                                <h4>CHILD HEALTH ID</h4>
                                <small>Digital Child Healthcare System</small>
                            </div>
                            <div className="qr-body">
                                <QRCodeCanvas value={registeredChild.childId} size={150} />
                                <div className="child-info-print">
                                    <p><strong>Name:</strong> {registeredChild.childName}</p>
                                    <p><strong>ID:</strong> {registeredChild.childId}</p>
                                    <p><strong>Mother:</strong> {registeredChild.motherName}</p>
                                </div>
                            </div>
                            <div className="card-footer-print">
                                <small>Please keep this card safely for clinic visits.</small>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button onClick={handlePrint} className="btn-print">Print QR Card</button>
                            <button onClick={() => { setRegisteredChild(null); onClose(); }} className="btn-close">Done</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}; 

export default ChildRegistrationModal; 