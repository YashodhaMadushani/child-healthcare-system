import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ClinicVisitModal = ({ isOpen, onClose, child, refreshData, midwifeName }) => {
  const [step, setStep] = useState(1);

  // Step 1 states - Growth Monitoring
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [headCircumference, setHeadCircumference] = useState('');
  const [growthStatus, setGrowthStatus] = useState('Normal Growth');

  // Step 2 states - Vaccination Checklist
  const [dueVaccines, setDueVaccines] = useState([]);
  const [administeredVaccines, setAdministeredVaccines] = useState([]);
  const [nextDueVaccineDate, setNextDueVaccineDate] = useState('');

  // Step 3 states - Doctor Referral
  const [referToDoctor, setReferToDoctor] = useState(false);
  const [referralReason, setReferralReason] = useState('Growth Retardation');
  const [referralNotes, setReferralNotes] = useState('');

  // Step 4 states - Visit Completion
  const [thriposhaDistributed, setThriposhaDistributed] = useState(false);
  const [thriposhaQuantity, setThriposhaQuantity] = useState(2);
  const [nextClinicDate, setNextClinicDate] = useState('');
  const [observations, setObservations] = useState('');

  // Set initial data when modal opens or child changes
  useEffect(() => {
    if (child) {
      setStep(1);
      // Fetch latest child info to get vaccination list
      axios.get(`http://localhost:5000/api/children/${child._id}`)
        .then(res => {
          const vaccines = res.data.vaccinations || [];
          // Filter out due or upcoming vaccines
          const due = vaccines.filter(v => v.status === 'Due' || v.status === 'Upcoming');
          setDueVaccines(due);
        })
        .catch(err => {
          console.error("Error fetching child details for vaccines:", err);
        });

      // Default next clinic date (1 month from now)
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setNextClinicDate(nextMonth.toISOString().split('T')[0]);
      
      // Clear previous inputs
      setWeight('');
      setHeight('');
      setHeadCircumference('');
      setGrowthStatus('Normal Growth');
      setAdministeredVaccines([]);
      setReferToDoctor(false);
      setReferralReason('Growth Retardation');
      setReferralNotes('');
      setThriposhaDistributed(false);
      setThriposhaQuantity(2);
      setObservations('');
    }
  }, [child, isOpen]);

  // Real-time growth risk calculation
  useEffect(() => {
    const w = parseFloat(weight);
    if (!w || isNaN(w)) {
      setGrowthStatus('Normal Growth');
      return;
    }
    if (w < 6.5) {
      setGrowthStatus('Severe Underweight Alert');
    } else if (w < 8.5) {
      setGrowthStatus('Moderate Risk');
    } else {
      setGrowthStatus('Normal Growth');
    }
  }, [weight]);

  if (!isOpen || !child) return null;

  const handleVaccineToggle = (vName) => {
    if (administeredVaccines.includes(vName)) {
      setAdministeredVaccines(administeredVaccines.filter(name => name !== vName));
    } else {
      setAdministeredVaccines([...administeredVaccines, vName]);
    }
  };

  const handleNext = () => {
    setStep(prev => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        weight: Number(weight) || undefined,
        height: Number(height) || undefined,
        headCircumference: Number(headCircumference) || undefined,
        ageInterval: child.growthRecords?.length ? `${child.growthRecords.length * 3}M` : 'Follow-up',
        administeredVaccines,
        nextDueVaccineDate,
        referToDoctor,
        referralReason: referToDoctor ? referralReason : undefined,
        referralNotes: referToDoctor ? referralNotes : undefined,
        thriposhaDistributed,
        thriposhaQuantity: thriposhaDistributed ? Number(thriposhaQuantity) : 0,
        nextClinicDate,
        observations,
        midwifeName: midwifeName || "MOH Midwife"
      };

      await axios.post(`http://localhost:5000/api/children/${child._id}/clinic-visit`, payload);
      alert("Clinic visit recorded and successfully synced to Parent's Mobile App!");
      if (refreshData) refreshData();
      onClose();
    } catch (err) {
      console.error("Failed to submit clinic visit:", err);
      alert("Failed to submit clinic visit records. Please try again.");
    }
  };

  // Helper styles for Health Indicator Badges
  const getBadgeStyle = () => {
    if (growthStatus === 'Severe Underweight Alert') {
      return { background: '#FFE4E6', color: '#E11D48', border: '1px solid #FDA4AF' };
    }
    if (growthStatus === 'Moderate Risk') {
      return { background: '#FEF3C7', color: '#D97706', border: '1px solid #FCD34D' };
    }
    return { background: '#DCFCE7', color: '#16A34A', border: '1px solid #86EFAC' };
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1050 }}>
      <div style={{ background: '#fff', borderRadius: '24px', width: '560px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', display: 'flex', flexDirection: 'column' }}>
        
        {/* Modal Header */}
        <div style={{ padding: '24px 28px', background: '#0F172A', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>Record Clinic Visit</h3>
            <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Child: <strong>{child.name}</strong> ({child.digitalHealthId})</span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '24px', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Step Indicator Progress Bar */}
        <div style={{ display: 'flex', padding: '16px 28px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', justifyContent: 'space-between', alignItems: 'center' }}>
          {[1, 2, 3, 4].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 'bold',
                background: step === s ? '#1D61FF' : step > s ? '#10B981' : '#E2E8F0',
                color: step >= s ? '#fff' : '#64748B'
              }}>
                {step > s ? '✓' : s}
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: step === s ? 'bold' : 'normal', color: step === s ? '#0F172A' : '#64748B' }}>
                {s === 1 ? 'Growth' : s === 2 ? 'Vaccines' : s === 3 ? 'Referral' : 'Complete'}
              </span>
              {s < 4 && <div style={{ width: '20px', height: '2px', background: step > s ? '#10B981' : '#E2E8F0' }} />}
            </div>
          ))}
        </div>

        {/* Modal Body / Steps */}
        <div style={{ padding: '28px', minHeight: '280px' }}>
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold', color: '#0F172A' }}>Step 1: Growth Monitoring</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748B', marginBottom: '6px' }}>Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 9.2"
                    required
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748B', marginBottom: '6px' }}>Height (cm) *</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 78.4"
                    required
                    value={height}
                    onChange={e => setHeight(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748B', marginBottom: '6px' }}>Head Circumference (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 42.5"
                  value={headCircumference}
                  onChange={e => setHeadCircumference(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none' }}
                />
              </div>

              {/* Health Indicator Badge */}
              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569' }}>Growth Status Indicator:</span>
                <span style={{
                  padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', display: 'inline-block',
                  transition: 'all 0.3s ease', ...getBadgeStyle()
                }}>
                  {growthStatus === 'Severe Underweight Alert' ? '⚠️ Severe Underweight Alert' : growthStatus === 'Moderate Risk' ? '⚠️ Moderate Risk' : '🟢 Normal Growth'}
                </span>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold', color: '#0F172A' }}>Step 2: Immunization & Vaccines</h4>
              
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>Select due vaccines administered during this clinic visit:</p>
              
              <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px' }} className="space-y-2.5">
                {dueVaccines.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: '#64748B', fontStyle: 'italic', textAlign: 'center', margin: '20px 0' }}>No pending vaccines for this child.</p>
                ) : (
                  dueVaccines.map((v, i) => (
                    <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#334155', cursor: 'pointer', padding: '8px', borderRadius: '8px', background: '#F8FAFC' }}>
                      <input
                        type="checkbox"
                        checked={administeredVaccines.includes(v.name)}
                        onChange={() => handleVaccineToggle(v.name)}
                        style={{ accentColor: '#1D61FF', cursor: 'pointer', width: '16px', height: '16px' }}
                      />
                      <div>
                        <span style={{ fontWeight: 'bold' }}>{v.name}</span>
                        {v.status && <span style={{ marginLeft: '8px', fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', background: v.status === 'Due' ? '#FFE4E6' : '#F1F5F9', color: v.status === 'Due' ? '#E11D48' : '#475569' }}>{v.status}</span>}
                      </div>
                    </label>
                  ))
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748B', marginBottom: '6px' }}>Next Scheduled Vaccine Due Date (Optional)</label>
                <input
                  type="date"
                  value={nextDueVaccineDate}
                  onChange={e => setNextDueVaccineDate(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none' }}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold', color: '#0F172A' }}>Step 3: Doctor Referral</h4>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 'bold', color: '#1D61FF', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={referToDoctor}
                    onChange={e => setReferToDoctor(e.target.checked)}
                    style={{ accentColor: '#1D61FF', cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  Refer Child to Doctor?
                </label>
              </div>

              {referToDoctor ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', transition: 'all 0.3s ease' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748B', marginBottom: '6px' }}>Reason for Referral</label>
                    <select
                      value={referralReason}
                      onChange={e => setReferralReason(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none', background: '#fff' }}
                    >
                      <option value="Growth Retardation">Growth Retardation</option>
                      <option value="Vaccine Complication">Vaccine Complication</option>
                      <option value="Illness">Illness / Infection</option>
                      <option value="Developmental Delay">Developmental Delay</option>
                      <option value="Other Medical Concern">Other Medical Concern</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748B', marginBottom: '6px' }}>Clinical / Referral Notes</label>
                    <textarea
                      placeholder="Add specific comments, vitals, or symptoms for the doctor's review..."
                      rows={3}
                      value={referralNotes}
                      onChange={e => setReferralNotes(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}
                    ></textarea>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: '12px' }}>
                  <span style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🩺</span>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', textAlign: 'center' }}>
                    No doctor referral requested. Check the option above if you need to dispatch this child profile to the Doctor's clinic queue.
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold', color: '#0F172A' }}>Step 4: Visit Completion & Distribution</h4>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#F0FDF4', borderRadius: '10px', border: '1px solid #DCFCE7' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', fontWeight: 'bold', color: '#16A34A', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={thriposhaDistributed}
                    onChange={e => setThriposhaDistributed(e.target.checked)}
                    style={{ accentColor: '#16A34A', cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  Thriposha Distributed?
                </label>
                {thriposhaDistributed && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 'bold' }}>Qty (Packets):</span>
                    <select
                      value={thriposhaQuantity}
                      onChange={e => setThriposhaQuantity(e.target.value)}
                      style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #86EFAC', outline: 'none', background: '#fff', fontSize: '0.8rem', fontWeight: 'bold' }}
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748B', marginBottom: '6px' }}>Next Scheduled Clinic Date *</label>
                <input
                  type="date"
                  required
                  value={nextClinicDate}
                  onChange={e => setNextClinicDate(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748B', marginBottom: '6px' }}>Midwife Clinical Observations / Advice</label>
                <textarea
                  placeholder="Record growth progress notes, counseling details, or nutritional advice..."
                  rows={3}
                  value={observations}
                  onChange={e => setObservations(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}
                ></textarea>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div style={{ padding: '20px 28px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            disabled={step === 1}
            onClick={handleBack}
            style={{
              padding: '10px 20px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#fff', color: '#475569',
              fontWeight: 'bold', cursor: step === 1 ? 'not-allowed' : 'pointer', opacity: step === 1 ? 0.5 : 1
            }}
          >
            Back
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: '#1D61FF', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              style={{ padding: '11px 28px', borderRadius: '10px', border: 'none', background: '#1D61FF', color: '#fff', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(29, 97, 255, 0.2)' }}
            >
              Complete Visit & Sync to Mobile App
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default ClinicVisitModal;
