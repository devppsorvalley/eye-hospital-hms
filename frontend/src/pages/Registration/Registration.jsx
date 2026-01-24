import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import Layout from '../../components/layout/Layout';
import PatientSearch from '../../components/common/PatientSearch';
import '../../styles/registration.css';

export default function Registration() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    uhid: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    relation_type: '',
    relation_name: '',
    gender: '',
    dob: '',
    age: '',
    phone: '',
    phone_code: '+91',
    district: '',
    tehsil: '',
    block: '',
    village: '',
    address: '',
    doctor: '',
    time: new Date().toTimeString().slice(0, 5),
    referred_by: '',
    chief_complaint: '',
    registration_date: new Date().toISOString().split('T')[0],
    weight: '',
    spo2: '',
    temperature: '',
    pulse: '',
    bp: '',
  });

  const [showVitals, setShowVitals] = useState(false);
  const [showQuickReg, setShowQuickReg] = useState(false);
  const [recentPatients, setRecentPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchRecentPatients();
  }, []);

  useEffect(() => {
    // Cleanup webcam on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const fetchRecentPatients = async () => {
    try {
      const response = await axios.get('/patients?page=1&limit=10');
      setRecentPatients(response.data.data || []);
    } catch (err) {
      // Silent fail for recent patients list
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear field error when user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Auto-calculate age from DOB
    if (name === 'dob' && value) {
      const today = new Date();
      const birthDate = new Date(value);
      let ageYears = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        ageYears--;
      }
      setFormData((prev) => ({ ...prev, age: ageYears.toString() }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.first_name?.trim()) {
      errors.first_name = 'First name is required';
    }
    if (!formData.last_name?.trim()) {
      errors.last_name = 'Last name is required';
    }
    if (!formData.gender) {
      errors.gender = 'Gender is required';
    }
    // DOB is now optional
    
    // Phone validation - be specific
    if (formData.phone && formData.phone.replace(/\D/g, '').length > 0 && formData.phone.replace(/\D/g, '').length !== 10) {
      errors.phone = 'Phone must be exactly 10 digits';
    }
    
    // Village/City is required for regular registration
    if (!formData.village?.trim()) {
      errors.village = 'Village/City is required';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    setMessage('');
    setFieldErrors({});
    
    // Validate
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // Prepare phone: default to 9999999999 if empty
      const phoneValue = formData.phone?.replace(/\D/g, '') || '';
      const finalPhone = phoneValue.length === 10 ? phoneValue : '9999999999';
      
      // Prepare village: save as blank if empty
      const finalVillage = formData.village?.trim() || '';
      
      // Prepare DOB: optional now
      const finalDob = formData.dob || undefined;
      
      // Backend expects: first_name, last_name, gender, phone (10 digits), village
      // Optional: middle_name, dob, address, district, tehsil, block, age, chief_complaint, weight, spo2, temperature, pulse, bp, patient_category, guardian_name, relation_to_patient, alternate_phone
      const payload = {
        first_name: formData.first_name.trim(),
        middle_name: formData.middle_name.trim() || undefined,
        last_name: formData.last_name.trim(),
        gender: formData.gender,
        dob: finalDob,
        age: formData.age ? parseInt(formData.age, 10) : undefined,
        phone: finalPhone,
        village: finalVillage,
        district: formData.district?.trim() || undefined,
        tehsil: formData.tehsil?.trim() || undefined,
        block: formData.block?.trim() || undefined,
        address: formData.address.trim() || undefined,
        chief_complaint: formData.chief_complaint?.trim() || undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        spo2: formData.spo2 ? parseInt(formData.spo2, 10) : undefined,
        temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
        pulse: formData.pulse ? parseInt(formData.pulse, 10) : undefined,
        bp: formData.bp?.trim() || undefined,
        guardian_name: formData.relation_name?.trim() || undefined,
        relation_to_patient: formData.relation_type || undefined,
        alternate_phone: undefined,
        photo: photoPreview || undefined,
      };

      // Remove undefined values
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      let response;
      if (editMode && formData.uhid) {
        response = await axios.put(`/patients/${formData.uhid}`, payload);
        setMessage(`Patient updated successfully: ${formData.uhid}`);
      } else {
        response = await axios.post('/patients', payload);
        const uhid = response.data.patient?.uhid || response.data.uhid || 'Unknown';
        setMessage(`Patient registered successfully with UHID: ${uhid}`);
      }

      fetchRecentPatients();
      clearForm();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to register patient';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const loadPatient = (patient) => {
    // Clear all errors
    setError('');
    setMessage('');
    setFieldErrors({});
    
    // Handle phone: strip if it's 9999999999 (our default)
    const phoneNum = patient.phone === '9999999999' ? '' : (patient.phone?.replace(/^\+\d+/, '') || '');
    const phoneCode = patient.phone?.match(/^\+\d+/)?.[0] || '+91';
    
    // Handle village: show empty if blank or 'None'
    const villageValue = (!patient.village || patient.village === 'None') ? '' : patient.village;
    
    // Check if patient has any vitals data
    const hasVitals = !!(patient.weight || patient.spo2 || patient.temperature || patient.pulse || patient.bp);
    
    setFormData({
      uhid: patient.uhid,
      first_name: patient.first_name || '',
      middle_name: patient.middle_name || '',
      last_name: patient.last_name || '',
      relation_type: patient.relation_to_patient || '',
      relation_name: patient.guardian_name || '',
      gender: patient.gender || '',
      dob: patient.dob?.split('T')[0] || '',
      age: patient.age ? patient.age.toString() : (patient.age_text || ''),
      phone: phoneNum,
      phone_code: phoneCode,
      district: patient.district || '',
      tehsil: patient.tehsil || '',
      block: patient.block || '',
      village: villageValue,
      address: patient.address || '',
      doctor: patient.doctor || '',
      time: new Date().toTimeString().slice(0, 5),
      referred_by: patient.referred_by || '',
      chief_complaint: patient.chief_complaint || '',
      registration_date: patient.registration_date?.split('T')[0] || new Date().toISOString().split('T')[0],
      weight: patient.weight ? patient.weight.toString() : '',
      spo2: patient.spo2 ? patient.spo2.toString() : '',
      temperature: patient.temperature ? patient.temperature.toString() : '',
      pulse: patient.pulse ? patient.pulse.toString() : '',
      bp: patient.bp || '',
    });
    
    // Load photo if available, clear if not
    setPhotoPreview(patient.photo || null);
    
    // Show vitals section if patient has vitals
    setShowVitals(hasVitals);
    
    setEditMode(true);
    setMessage(`Loaded patient: ${patient.first_name} ${patient.last_name} (UHID: ${patient.uhid})`);
  };

  const clearForm = () => {
    setFormData({
      uhid: '',
      first_name: '',
      middle_name: '',
      last_name: '',
      relation_type: '',
      relation_name: '',
      gender: '',
      dob: '',
      age: '',
      phone: '',
      phone_code: '+91',
      district: '',
      tehsil: '',
      block: '',
      village: '',
      address: '',
      doctor: '',
      time: new Date().toTimeString().slice(0, 5),
      referred_by: '',
      chief_complaint: '',
      registration_date: new Date().toISOString().split('T')[0],
      weight: '',
      spo2: '',
      temperature: '',
      pulse: '',
      bp: '',
    });
    setEditMode(false);
    setMessage('');
    setError('');
    setFieldErrors({});
    setPhotoPreview(null);
    setShowVitals(false);
    stopWebcam();
  };

  const handleDeactivate = async () => {
    if (!formData.uhid) {
      setError('No patient loaded to deactivate');
      return;
    }

    if (!window.confirm(`Are you sure you want to deactivate patient UHID ${formData.uhid}?`)) {
      return;
    }

    try {
      await axios.delete(`/patients/${formData.uhid}`);
      setMessage('Patient deactivated successfully');
      fetchRecentPatients();
      clearForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to deactivate patient');
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Photo must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target.result);
      };
      reader.onerror = (error) => {
        setError('Failed to read photo file');
      };
      reader.readAsDataURL(file);
    }
    // Reset file input to allow selecting the same file again
    e.target.value = '';
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 } 
      });
      streamRef.current = stream;
      
      // Set active FIRST so video element is rendered in DOM
      setIsWebcamActive(true);
      
      // Wait for next render cycle so video element exists
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video metadata to load BEFORE playing
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Timeout waiting for video metadata'));
          }, 5000);
          
          videoRef.current.onloadedmetadata = () => {
            clearTimeout(timeout);
            resolve();
          };
        });
        
        await videoRef.current.play();
        
        // Wait a bit more for data to flow
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        throw new Error('Video element not found');
      }
    } catch (err) {
      setError('Failed to access webcam. Please check permissions.');
      // Clean up on error
      setIsWebcamActive(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsWebcamActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setPhotoPreview(dataUrl);
      stopWebcam();
    } else {
      setError('Webcam not ready. Please wait a moment and try again.');
    }
  };

  const handleQuickRegister = async (e) => {
    e.preventDefault();
    const form = e.target;
    const fullName = form.qr_name.value.trim();
    const nameParts = fullName.split(' ');
    
    if (!fullName || !form.qr_gender.value || !form.qr_address.value) {
      setError('Name, gender, and address are required for quick registration');
      return;
    }
    
    // Prepare phone: validate length, default to 9999999999 if empty or invalid
    const phoneValue = form.qr_phone.value ? form.qr_phone.value.replace(/\D/g, '') : '';
    if (phoneValue.length > 0 && phoneValue.length !== 10) {
      setError('Phone must be exactly 10 digits');
      return;
    }
    const finalPhone = phoneValue.length === 10 ? phoneValue : '9999999999';
    
    // For quick register, save full address in address field, set village to blank
    // Blank village will be excluded from searches as per backend logic
    
    // Backend expects: first_name, last_name, gender, phone (10 digits), village
    const quickData = {
      first_name: nameParts[0],
      last_name: nameParts.slice(1).join(' ') || nameParts[0],
      gender: form.qr_gender.value,
      phone: finalPhone,
      village: '',
      address: form.qr_address.value,
      age: form.qr_age.value ? parseInt(form.qr_age.value, 10) : undefined,
    };

    try {
      const response = await axios.post('/patients', quickData);
      const uhid = response.data.patient?.uhid || response.data.uhid || 'Unknown';
      setMessage(`Quick registration successful! UHID: ${uhid}`);
      setShowQuickReg(false);
      fetchRecentPatients();
      form.reset();
      clearForm();
    } catch (err) {
      const errorMsg = err.response?.data?.errors?.join(', ') || err.response?.data?.message || 'Failed to quick register';
      setError(errorMsg);
    }
  };

  return (
    <Layout>
      <div className="reg-container">
        <div className="reg-panel reg-left">
          <div className="panel-title">Patient Registration</div>

          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          <div className="reg-row">
            <div style={{ flex: 1 }}>
              <label>UHID (Auto)</label>
              <input type="text" value={formData.uhid} disabled placeholder="Auto-generated UHID" className="disabled" />
              <div className="tiny-muted">UHID is auto-generated</div>
            </div>
            <div style={{ width: '200px' }}>
              <label>Registration Date <span className="required">*</span></label>
              <input type="date" name="registration_date" value={formData.registration_date} onChange={handleChange} disabled={editMode} />
            </div>
          </div>

          <div>
            <label>Full Name <span className="required">*</span></label>
            <div className="grid-3">
              <div>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="First name"
                  className={fieldErrors.first_name ? 'error' : ''}
                />
                {fieldErrors.first_name && <div className="field-error">{fieldErrors.first_name}</div>}
              </div>
              <input type="text" name="middle_name" value={formData.middle_name} onChange={handleChange} placeholder="Middle (optional)" />
              <div>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Last name"
                  className={fieldErrors.last_name ? 'error' : ''}
                />
                {fieldErrors.last_name && <div className="field-error">{fieldErrors.last_name}</div>}
              </div>
            </div>
          </div>

          <div>
            <label>Relation</label>
            <div className="grid-2">
              <select name="relation_type" value={formData.relation_type} onChange={handleChange}>
                <option value="">-- select --</option>
                <option value="S/o">S/o (Son of)</option>
                <option value="D/o">D/o (Daughter of)</option>
                <option value="W/o">W/o (Wife of)</option>
                <option value="Other">Other</option>
              </select>
              <input type="text" name="relation_name" value={formData.relation_name} onChange={handleChange} placeholder="Enter father's or husband's name" />
            </div>
          </div>

          <div>
            <div className="grid-3">
              <div>
                <label>District</label>
                <input type="text" name="district" value={formData.district} onChange={handleChange} placeholder="Pithoragarh" list="district-list" />
                <datalist id="district-list">
                  <option value="Pithoragarh" />
                  <option value="Almora" />
                  <option value="Nainital" />
                </datalist>
              </div>
              <div>
                <label>Tehsil</label>
                <input type="text" name="tehsil" value={formData.tehsil} onChange={handleChange} placeholder="Tehsil" list="tehsil-list" />
                <datalist id="tehsil-list" />
              </div>
              <div>
                <label>Block</label>
                <input type="text" name="block" value={formData.block} onChange={handleChange} placeholder="Block" list="block-list" />
                <datalist id="block-list" />
              </div>
            </div>
          </div>

          <div className="grid-2">
            <div>
              <label>Village / City <span className="required">*</span></label>
              <input 
                type="text" 
                name="village" 
                value={formData.village} 
                onChange={handleChange} 
                placeholder="Village or City" 
                list="village-list"
                className={fieldErrors.village ? 'error' : ''}
              />
              <datalist id="village-list" />
              {fieldErrors.village && <div className="field-error">{fieldErrors.village}</div>}
            </div>
            <div>
              <label>Address (Street / Locality / Landmark)</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter address"
                rows="3"
                className={fieldErrors.address ? 'error' : ''}
              />
              {fieldErrors.address && <div className="field-error">{fieldErrors.address}</div>}
            </div>
          </div>

          <div>
            <label>Gender <span className="required">*</span></label>
            <div className="grid-3">
              <div>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={fieldErrors.gender ? 'error' : ''}
                >
                  <option value="">-- select --</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {fieldErrors.gender && <div className="field-error">{fieldErrors.gender}</div>}
              </div>
              <div>
                <label>Date of Birth</label>
                <input 
                  type="date" 
                  name="dob" 
                  value={formData.dob} 
                  onChange={handleChange} 
                  placeholder="Date of Birth"
                  className={fieldErrors.dob ? 'error' : ''}
                />
                {fieldErrors.dob && <div className="field-error">{fieldErrors.dob}</div>}
                <div className="tiny-muted">Auto-calculates Age</div>
              </div>
              <div>
                <label>Age (years)</label>
                <input type="text" name="age" value={formData.age} onChange={handleChange} placeholder="Age" disabled={!!formData.dob} />
              </div>
            </div>
          </div>

          <div>
            <div className="grid-4">
              <div>
                <label>Phone <span className="required">*</span></label>
                <div className="phone-input">
                  <input
                    type="text"
                    name="phone_code"
                    value={formData.phone_code}
                    onChange={handleChange}
                    style={{ width: '70px' }}
                    placeholder="+91"
                  />
                  <input 
                    type="text" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    placeholder="10 digit mobile number" 
                    style={{ flex: 1 }}
                    className={fieldErrors.phone ? 'error' : ''}
                  />
                </div>
                {fieldErrors.phone && <div className="field-error">{fieldErrors.phone}</div>}
                <div className="tiny-muted">10 digits required</div>
              </div>
              <div>
                <label>Doctor (optional)</label>
                <select name="doctor" value={formData.doctor} onChange={handleChange}>
                  <option value="">-- select --</option>
                  <option value="Dr. Sharma">Dr. Sharma</option>
                  <option value="Dr. Kumar">Dr. Kumar</option>
                  <option value="Dr. Patel">Dr. Patel</option>
                </select>
              </div>
              <div>
                <label>Time</label>
                <input type="time" name="time" value={formData.time} onChange={handleChange} />
              </div>
              <div>
                <label>Referred by (optional)</label>
                <input type="text" name="referred_by" value={formData.referred_by} onChange={handleChange} placeholder="Referred by" />
              </div>
            </div>
          </div>

          <div>
            <label>Chief Eye Complaint (optional)</label>
            <textarea name="chief_complaint" value={formData.chief_complaint} onChange={handleChange} placeholder="Describe the eye complaint..." rows="3" />
          </div>

          <div className="row" style={{ alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ flex: '0 0 180px' }}>
              <label>Photo</label>
              <div className="photo-box">
                {isWebcamActive ? (
                  <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : photoPreview ? (
                  <img src={photoPreview} alt="Patient" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div className="tiny muted">No photo</div>
                )}
              </div>
              <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                <button type="button" className="btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()}>Choose File</button>
                {isWebcamActive ? (
                  <>
                    <button type="button" className="btn-secondary btn-sm" onClick={capturePhoto}>Capture</button>
                    <button type="button" className="btn-secondary btn-sm" onClick={stopWebcam}>Stop</button>
                  </>
                ) : (
                  <button type="button" className="btn-secondary btn-sm" onClick={startWebcam}>Webcam</button>
                )}
              </div>
              <div className="small-note">Max 2MB</div>
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={showVitals} onChange={(e) => setShowVitals(e.target.checked)} />
                Add Vitals
              </label>
              {showVitals && (
                <div style={{ marginTop: '8px' }}>
                  <div className="grid-3">
                    <div>
                      <label>Weight (kg)</label>
                      <input type="number" name="weight" value={formData.weight} onChange={handleChange} step="0.1" />
                    </div>
                    <div>
                      <label>SPO2 (%)</label>
                      <input type="number" name="spo2" value={formData.spo2} onChange={handleChange} step="1" min="0" max="100" />
                    </div>
                    <div>
                      <label>Temperature (°C)</label>
                      <input type="number" name="temperature" value={formData.temperature} onChange={handleChange} step="0.1" />
                    </div>
                  </div>
                  <div className="grid-3" style={{ marginTop: '8px' }}>
                    <div>
                      <label>Pulse</label>
                      <input type="number" name="pulse" value={formData.pulse} onChange={handleChange} step="1" min="0" max="300" />
                    </div>
                    <div>
                      <label>BP (mmHg)</label>
                      <input type="text" name="bp" value={formData.bp} onChange={handleChange} placeholder="120/80" />
                    </div>
                    <div></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="actions">
            <button type="submit" className="btn" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : editMode ? 'Save Changes' : 'Register'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => {
              if (!formData.uhid) {
                alert('Please load or register a patient first');
                return;
              }
              navigate('/opd', { state: { patient: formData } });
            }}>Add to OPD</button>
            {editMode && <button type="button" className="btn-danger" onClick={handleDeactivate}>Deactivate</button>}
            <button type="button" className="btn-secondary btn-clear" onClick={clearForm}>Clear Form</button>
          </div>

          <div className="tiny muted" style={{ marginTop: '12px' }}>
            <strong>Notes:</strong> red * = required fields
          </div>
        </div>

        <div className="reg-panel reg-right">
          <PatientSearch 
            onSelectPatient={loadPatient}
            showQuickReg={true}
            onQuickReg={() => setShowQuickReg(true)}
          />

          <div style={{ marginTop: '16px' }}>
            <div className="tiny muted"><strong>Recent Registrations</strong></div>
            <div className="recent-list">
              {recentPatients.map((patient) => (
                <div key={patient.uhid} className="recent-item" onClick={() => loadPatient(patient)}>
                  <div className="recent-uhid">{patient.uhid}</div>
                  <div className="recent-name">{patient.first_name} {patient.last_name}</div>
                  <div className="recent-phone">{patient.phone || 'No phone'}</div>
                  <div className="recent-date">{patient.registration_date?.split('T')[0]}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <div className="tiny muted"><strong>System Notes</strong></div>
            <ul className="tiny muted" style={{ paddingLeft: '16px', lineHeight: '1.6' }}>
              <li>UHID is auto-generated</li>
              <li>Phone is optional</li>
            </ul>
          </div>
        </div>
      </div>

      {showQuickReg && (
        <div className="modal-overlay" onClick={() => setShowQuickReg(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Quick Register</h3>
            <form onSubmit={handleQuickRegister}>
              <input name="qr_name" placeholder="Full name (First Last)" required />
              <select name="qr_gender" required>
                <option value="">Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <input name="qr_age" placeholder="Age in years (optional)" />
              <input name="qr_address" placeholder="Address (single line)" required />
              <input name="qr_phone" placeholder="Mobile number (optional)" />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowQuickReg(false)}>Cancel</button>
                <button type="submit" className="btn">Quick Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
