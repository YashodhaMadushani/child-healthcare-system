import React, { useState, useRef } from 'react';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';
import { useReactToPrint } from 'react-to-print';
import './Modal.css';

const MOH_AREAS = [
  "Imaduwa Central",
  "Dikkumbura",
  "Thittagalla",
  "Paragoda",
  "Kombala",
  "Bedipita",
  "Hatangala",
  "Puswelkada",
  "Danduwana",
  "Agulugaha",
  "Dorape",
  "Kahanda",
  "Induranvila",
  "Deegoda",
  "Kodagoda",
  "Andugoda",
  "Hettigoda"
];

const GUARDIAN_TYPES = [
  "Mother",
  "Father",
  "Grandparent",
  "Legal Guardian",
  "Care Facility / Orphanage"
];

const ChildRegistrationModal = ({ isOpen, onClose, refreshData, staffId }) => {
  const componentRef = useRef();

  const initialFormState = {
    // 1. Cross-Reference Identifiers
    chdrNo: '',
    birthCertRegNo: '',

    // 2. Child Basic Info
    childName: '',
    nameWithInitials: '',
    dob: '',
    gender: 'Boy', // Boy / Girl
    birthWeight: '',
    birthHeight: '',
    headCircumference: '',
    birthHospital: '',

    // 3. Flexible Parent / Guardian Details
    isMotherAbsent: false,
    guardianType: 'Mother',
    guardianName: '',
    guardianNic: '',
    motherName: '',
    phone: '',
    secondaryPhone: '',

    // 4. Administrative & Location Info
    address: '',
    mohArea: 'Dorape',
    phmRange: '',
    gnDivision: '',
    assignedClinicCenter: '',

    // 5. Medical Risk Indicators
    bloodGroup: 'Unknown',
    riskIndicators: {
      lowBirthWeight: false,
      prematureBirth: false,
      congenitalCondition: false,
      specialDoctorCare: false
    }
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

    // Auto calculate low birth weight risk flag if weight < 2.5kg
    const currentWeight = Number(formData.birthWeight) || 0;
    const updatedRiskIndicators = {
      ...formData.riskIndicators,
      lowBirthWeight: currentWeight > 0 && currentWeight < 2.5 ? true : formData.riskIndicators.lowBirthWeight
    };

    const payload = {
      name: formData.childName,
      nameWithInitials: formData.nameWithInitials,
      chdrNo: formData.chdrNo,
      birthCertRegNo: formData.birthCertRegNo,
      dob: formData.dob,
      gender: formData.gender,
      birthWeight: Number(formData.birthWeight) || 0,
      birthHeight: Number(formData.birthHeight) || 0,
      headCircumference: Number(formData.headCircumference) || 0,
      birthHospital: formData.birthHospital,
      isMotherAbsent: formData.isMotherAbsent,
      guardianType: formData.guardianType,
      guardianName: formData.guardianName,
      guardianNic: formData.guardianNic,
      motherName: formData.isMotherAbsent ? (formData.motherName || 'Deceased/Absent') : (formData.motherName || formData.guardianName),
      phone: formData.phone,
      secondaryPhone: formData.secondaryPhone,
      address: formData.address,
      mohArea: formData.mohArea,
      phmRange: formData.phmRange,
      gnDivision: formData.gnDivision,
      assignedClinicCenter: formData.assignedClinicCenter,
      bloodGroup: formData.bloodGroup,
      riskIndicators: updatedRiskIndicators,
      registeredBy: staffId || "Staff Member"
    };

    try {
      const res = await axios.post('http://localhost:5000/api/children/register', payload);

      if (res.status === 201 && res.data.child) {
        setRegisteredChild({
          digitalHealthId: res.data.child.digitalHealthId,
          childName: res.data.child.name,
          motherName: res.data.child.motherName || res.data.child.guardianName
        });

        alert("Child registered successfully with Lifelong Digital ID!");
        if (refreshData) refreshData();
      }
    } catch (err) {
      console.error("Registration Error Details:", err.response?.data);
      alert("Error: " + (err.response?.data?.msg || "Registration failed. Please try again."));
    }
  };

  const handleCloseAndReset = () => {
    setRegisteredChild(null);
    setFormData(initialFormState);
    onClose();
  };

  const handleRiskChange = (key) => {
    setFormData(prev => ({
      ...prev,
      riskIndicators: {
        ...prev.riskIndicators,
        [key]: !prev.riskIndicators[key]
      }
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content registration-modal" style={{ maxWidth: '820px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
        {!registeredChild ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #E2E8F0' }}>
              <div>
                <h3 className="modal-title" style={{ margin: 0, fontSize: '1.4rem', color: '#0F172A' }}>Child Clinical Registration</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748B' }}>Ministry of Health Child Health Development Record (CHDR) Entry</p>
              </div>
              <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94A3B8' }}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* SECTION 1: Legacy Cross-Reference Identifiers */}
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', fontWeight: 'bold', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  1. Cross-Reference Identifiers
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748B', marginBottom: '6px' }}>CHDR / Health Book Number (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. CHDR-2026/04812"
                      value={formData.chdrNo}
                      onChange={e => setFormData({ ...formData, chdrNo: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748B', marginBottom: '6px' }}>Birth Certificate Reg. Number (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. BC-REG-894123"
                      value={formData.birthCertRegNo}
                      onChange={e => setFormData({ ...formData, birthCertRegNo: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Child Basic Info */}
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', fontWeight: 'bold', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  2. Child Basic Info
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748B', marginBottom: '6px' }}>Full Name *</label>
                    <input
                      type="text"
                      placeholder="Child's Full Name"
                      required
                      value={formData.childName}
                      onChange={e => setFormData({ ...formData, childName: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748B', marginBottom: '6px' }}>Name with Initials</label>
                    <input
                      type="text"
                      placeholder="e.g. K.A. Sahan Perera"
                      value={formData.nameWithInitials}
                      onChange={e => setFormData({ ...formData, nameWithInitials: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748B', marginBottom: '6px' }}>Date of Birth *</label>
                    <input
                      type="date"
                      required
                      value={formData.dob}
                      onChange={e => setFormData({ ...formData, dob: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748B', marginBottom: '6px' }}>Gender *</label>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', height: '42px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="gender"
                          value="Boy"
                          checked={formData.gender === 'Boy'}
                          onChange={e => setFormData({ ...formData, gender: e.target.value })}
                          style={{ accentColor: '#1D61FF' }}
                        />
                        👦 Boy
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="gender"
                          value="Girl"
                          checked={formData.gender === 'Girl'}
                          onChange={e => setFormData({ ...formData, gender: e.target.value })}
                          style={{ accentColor: '#E11D48' }}
                        />
                        👧 Girl
                      </label>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748B', marginBottom: '6px' }}>Hospital / Birth Clinic Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Mahamodara Teaching Hospital"
                      value={formData.birthHospital}
                      onChange={e => setFormData({ ...formData, birthHospital: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748B', marginBottom: '6px' }}>Birth Weight (kg) *</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 3.25"
                      required
                      value={formData.birthWeight}
                      onChange={e => setFormData({ ...formData, birthWeight: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748B', marginBottom: '6px' }}>Birth Height (cm) *</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 49.5"
                      required
                      value={formData.birthHeight}
                      onChange={e => setFormData({ ...formData, birthHeight: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748B', marginBottom: '6px' }}>Head Circumference (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 34.0"
                      value={formData.headCircumference}
                      onChange={e => setFormData({ ...formData, headCircumference: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Flexible Parent / Guardian Details */}
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 'bold', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    3. Parent / Guardian Details
                  </h4>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 'bold', color: '#E11D48', cursor: 'pointer', background: '#FFE4E6', padding: '4px 10px', borderRadius: '20px' }}>
                    <input
                      type="checkbox"
                      checked={formData.isMotherAbsent}
                      onChange={e => setFormData({ ...formData, isMotherAbsent: e.target.checked })}
                      style={{ accentColor: '#E11D48', cursor: 'pointer' }}
                    />
                    Is Mother Deceased or Absent after birth?
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748B', marginBottom: '6px' }}>Guardian Type *</label>
                    <select
                      value={formData.guardianType}
                      onChange={e => setFormData({ ...formData, guardianType: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none', background: '#fff' }}
                    >
                      {GUARDIAN_TYPES.map((type, idx) => (
                        <option key={idx} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748B', marginBottom: '6px' }}>Primary Guardian Name *</label>
                    <input
                      type="text"
                      placeholder="Full Name of Guardian"
                      required
                      value={formData.guardianName}
                      onChange={e => {
                        const val = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          guardianName: val,
                          motherName: !prev.isMotherAbsent && prev.guardianType === 'Mother' ? val : prev.motherName
                        }));
                      }}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748B', marginBottom: '6px' }}>Guardian NIC / Passport Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 198851204912"
                      value={formData.guardianNic}
                      onChange={e => setFormData({ ...formData, guardianNic: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748B', marginBottom: '6px' }}>Biological Mother's Name</label>
                    <input
                      type="text"
                      placeholder={formData.isMotherAbsent ? "Optional / Absent" : "Mother's Full Name"}
                      disabled={formData.isMotherAbsent}
                      value={formData.isMotherAbsent ? 'Absent / Deceased' : formData.motherName}
                      onChange={e => setFormData({ ...formData, motherName: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none', background: formData.isMotherAbsent ? '#F1F5F9' : '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748B', marginBottom: '6px' }}>Primary Contact Phone * (For SMS & App Login)</label>
                    <input
                      type="tel"
                      placeholder="e.g. 0771234567"
                      required
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748B', marginBottom: '6px' }}>Secondary Contact Number (Optional)</label>
                    <input
                      type="tel"
                      placeholder="e.g. 0912234567"
                      value={formData.secondaryPhone}
                      onChange={e => setFormData({ ...formData, secondaryPhone: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: Administrative & Location Info */}
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', fontWeight: 'bold', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  4. Administrative & Location Info
                </h4>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748B', marginBottom: '6px' }}>Residential Address *</label>
                  <textarea
                    placeholder="Full Permanent Address"
                    required
                    rows={2}
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}
                  ></textarea>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748B', marginBottom: '6px' }}>MOH Area *</label>
                    <select
                      value={formData.mohArea}
                      onChange={e => setFormData({ ...formData, mohArea: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none', background: '#fff' }}
                    >
                      {MOH_AREAS.map((area, i) => (
                        <option key={i} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748B', marginBottom: '6px' }}>Midwife Division / PHM Range</label>
                    <input
                      type="text"
                      placeholder="e.g. PHM Range 04"
                      value={formData.phmRange}
                      onChange={e => setFormData({ ...formData, phmRange: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748B', marginBottom: '6px' }}>Grama Niladhari Division</label>
                    <input
                      type="text"
                      placeholder="e.g. GN Division 524"
                      value={formData.gnDivision}
                      onChange={e => setFormData({ ...formData, gnDivision: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748B', marginBottom: '6px' }}>Assigned Clinic Center</label>
                    <input
                      type="text"
                      placeholder="e.g. Dorape MOH Clinic"
                      value={formData.assignedClinicCenter}
                      onChange={e => setFormData({ ...formData, assignedClinicCenter: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: Medical Risk Indicators */}
              <div style={{ background: '#FFF1F2', padding: '16px', borderRadius: '12px', border: '1px solid #FECDD3' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', fontWeight: 'bold', color: '#9F1239', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  5. Medical Risk Indicators
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', alignItems: 'center' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#9F1239', marginBottom: '6px' }}>Blood Group</label>
                    <select
                      value={formData.bloodGroup}
                      onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #FDA4AF', fontSize: '0.9rem', outline: 'none', background: '#fff', fontWeight: 'bold' }}
                    >
                      <option value="Unknown">Unknown</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#9F1239', marginBottom: '8px' }}>Risk Factors & Special Care Checkboxes</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#881337', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.riskIndicators.lowBirthWeight || (Number(formData.birthWeight) > 0 && Number(formData.birthWeight) < 2.5)}
                          onChange={() => handleRiskChange('lowBirthWeight')}
                          style={{ accentColor: '#E11D48' }}
                        />
                        Low Birth Weight (&lt;2.5kg)
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#881337', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.riskIndicators.prematureBirth}
                          onChange={() => handleRiskChange('prematureBirth')}
                          style={{ accentColor: '#E11D48' }}
                        />
                        Premature Birth
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#881337', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.riskIndicators.congenitalCondition}
                          onChange={() => handleRiskChange('congenitalCondition')}
                          style={{ accentColor: '#E11D48' }}
                        />
                        Congenital Condition
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#881337', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.riskIndicators.specialDoctorCare}
                          onChange={() => handleRiskChange('specialDoctorCare')}
                          style={{ accentColor: '#E11D48' }}
                        />
                        Requires Special Doctor Care
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '10px' }}>
                <button type="button" className="btn-cancel" onClick={onClose} style={{ padding: '12px 24px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#fff', color: '#64748B', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ padding: '12px 28px', borderRadius: '10px', border: 'none', background: '#1D61FF', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Register Child</button>
              </div>
            </form>
          </>
        ) : (
          <div className="success-view" style={{ textAlign: 'center', padding: '10px' }}>
            <h3 style={{ color: '#16A34A', fontSize: '1.4rem', marginBottom: '16px' }}>Registration Successful! ✅</h3>
            <div ref={componentRef} className="qr-card-to-print" style={{ border: '2px dashed #1D61FF', padding: '20px', borderRadius: '12px', background: '#F8FAFC', marginBottom: '20px' }}>
              <div className="card-header-print">
                <h4 style={{ color: '#1D61FF', margin: 0 }}>LIFELONG DIGITAL HEALTH ID</h4>
                <small style={{ color: '#64748B' }}>Ministry of Healthcare, Sri Lanka</small>
              </div>
              <div className="qr-body" style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <QRCodeCanvas value={registeredChild.digitalHealthId || "N/A"} size={160} />
                <div className="child-info-print" style={{ textAlign: 'left', width: '100%', fontSize: '0.9rem', lineHeight: '1.6' }}>
                  <p style={{ margin: '4px 0' }}><strong>Name:</strong> {registeredChild.childName}</p>
                  <p style={{ margin: '4px 0' }}><strong>Digital ID:</strong> <span style={{ color: '#1D61FF', fontWeight: 'bold' }}>{registeredChild.digitalHealthId}</span></p>
                  <p style={{ margin: '4px 0' }}><strong>Guardian/Mother:</strong> {registeredChild.motherName}</p>
                </div>
              </div>
              <div className="card-footer-print">
                <small style={{ color: '#64748B' }}>This is a lifelong identity card carrier from birth to death.</small>
              </div>
            </div>
            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
              <button onClick={() => handlePrint()} className="btn-print" style={{ padding: '10px 24px', borderRadius: '8px', background: '#1D61FF', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Print QR Card</button>
              <button onClick={handleCloseAndReset} className="btn-close" style={{ padding: '10px 24px', borderRadius: '8px', background: '#64748B', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Done</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChildRegistrationModal;