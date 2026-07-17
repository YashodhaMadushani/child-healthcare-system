import React, { useState, useRef } from 'react';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';
import { useReactToPrint } from 'react-to-print';
import './Modal.css';

// 🛠️ 'staffId' Prop එකක් ලෙස ඇතුළත් කර ඇති අතර, එය ලොග් වී සිටින නිලධාරියා හඳුනා ගැනීමට යොදා ගනී
const ChildRegistrationModal = ({ isOpen, onClose, refreshData, staffId }) => {
    const componentRef = useRef();
    
    // Form එකේ මූලික හිස් දත්ත ව්‍යුහය (Initial State)
    const initialFormState = {
        childName: '',
        dob: '',
        gender: 'Male',
        birthWeight: '',
        birthHeight: '',
        motherName: '',
        phone: '',
        address: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [registeredChild, setRegisteredChild] = useState(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef, 
        documentTitle: registeredChild ? `Digital_ID_Card_${registeredChild.digitalHealthId}` : 'Digital_ID_Card',
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        
        console.log("Submitting form data to Backend...", formData);

        try {
            // 🛠️ Backend එකේ Controller එක බලාපොරොත්තු වන 'name' සහ අනෙකුත් fields හරියටම ගලපා ඇත
            const res = await axios.post('http://localhost:5000/api/children/register', {
                name: formData.childName, // childName වෙනුවට Backend Schema එකේ ඇති 'name' ලෙසම යවයි
                dob: formData.dob,
                gender: formData.gender,
                motherName: formData.motherName,
                birthWeight: Number(formData.birthWeight) || 0,
                birthHeight: Number(formData.birthHeight) || 0,
                phone: formData.phone,
                address: formData.address,
                registeredBy: staffId || "Staff Member" // වගවීම තහවුරු කිරීමට Staff ID එක යැවීම
            });
            
            // Backend එකෙන් status 201 (Created) සහ child object එක ලැබුණේ දැයි බලයි
            if (res.status === 201 && res.data.child) {
                
                // සාර්ථකව ලැබුණු දත්ත මතක තබාගෙන QR Card එක පෙන්වීමට සකසයි
                setRegisteredChild({
                    digitalHealthId: res.data.child.digitalHealthId,
                    childName: res.data.child.name, // Backend එකෙන් එන්නේ 'name' ලෙසයි
                    motherName: res.data.child.motherName
                });
                
                alert("Child registered successfully with Lifelong Digital ID!");
                
                // Dashboard ලිස්ට් එක පිටුපසින් Auto Refresh කරවීමට
                if (refreshData) refreshData();
            }
        } catch (err) {
            console.error("Registration Error Details:", err.response?.data);
            alert("Error: " + (err.response?.data?.msg || "Registration failed. Please try again."));
        }
    };

    // 🛠️ සාර්ථකව ලියාපදිංචි වී අවසන් වූ පසු Form එක පිරිසිදු කර Modal එක වැසීමට
    const handleCloseAndReset = () => {
        setRegisteredChild(null);
        setFormData(initialFormState); // Form fields සියල්ලම සදහටම Reset වේ
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content registration-modal">
                {!registeredChild ? (
                    <>
                        <h3 className="modal-title">Start New Registration</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                {/* 1. Child's Name */}
                                <input 
                                    type="text" 
                                    placeholder="Child's Full Name" 
                                    required 
                                    value={formData.childName}
                                    onChange={e => setFormData({...formData, childName: e.target.value})} 
                                />
                                
                                {/* 2. Date of Birth */}
                                <input 
                                    type="date" 
                                    required 
                                    value={formData.dob}
                                    onChange={e => setFormData({...formData, dob: e.target.value})} 
                                />
                                
                                {/* 3. Gender */}
                                <select 
                                    value={formData.gender} 
                                    onChange={e => setFormData({...formData, gender: e.target.value})}
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                                
                                {/* 4. Birth Weight (🛠️ onChange සහ value බන්ධනය කර ඇත) */}
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    placeholder="Birth Weight (kg)" 
                                    required 
                                    value={formData.birthWeight}
                                    onChange={e => setFormData({...formData, birthWeight: e.target.value})} 
                                />
                                
                                {/* 5. Birth Height (🛠️ onChange සහ value බන්ධනය කර ඇත) */}
                                <input 
                                    type="number" 
                                    step="0.1" 
                                    placeholder="Birth Height (cm)" 
                                    required 
                                    value={formData.birthHeight}
                                    onChange={e => setFormData({...formData, birthHeight: e.target.value})} 
                                />
                                
                                {/* 6. Mother's Name */}
                                <input 
                                    type="text" 
                                    placeholder="Mother's Name" 
                                    required 
                                    value={formData.motherName}
                                    onChange={e => setFormData({...formData, motherName: e.target.value})} 
                                />
                                
                                {/* 7. Phone Number */}
                                <input 
                                    type="tel" 
                                    placeholder="Phone Number" 
                                    required 
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                                />
                                
                                {/* 8. Address */}
                                <textarea 
                                    placeholder="Address" 
                                    required 
                                    value={formData.address}
                                    onChange={e => setFormData({...formData, address: e.target.value})}
                                ></textarea>
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
                                <h4>LIFELONG DIGITAL HEALTH ID</h4>
                                <small>National Digital Healthcare Ecosystem</small>
                            </div>
                            <div className="qr-body">
                                <QRCodeCanvas value={registeredChild.digitalHealthId || "N/A"} size={150} />
                                <div className="child-info-print">
                                    <p><strong>Name:</strong> {registeredChild.childName}</p>
                                    <p><strong>Digital ID:</strong> {registeredChild.digitalHealthId}</p>
                                    <p><strong>Mother:</strong> {registeredChild.motherName}</p>
                                </div>
                            </div>
                            <div className="card-footer-print">
                                <small>This is a lifelong identity card carrier from birth to death.</small>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button onClick={() => handlePrint()} className="btn-print">Print QR Card</button>
                            <button onClick={handleCloseAndReset} className="btn-close">Done</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}; 

export default ChildRegistrationModal;