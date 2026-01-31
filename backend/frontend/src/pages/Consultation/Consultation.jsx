import { useState, useEffect } from 'react';
import { authStore } from '../../store/auth.store';
import Layout from '../../components/layout/Layout';
import { 
  getICDCodes, 
  getTodayOPDQueue, 
  getPatientConsultations, 
  createConsultation,
  updateConsultation,
  addICDCode,
  removeICDCode,
  updateOPDStatus
} from '../../api/consultation.api';
import '../../styles/consultation.css';

// Severity and urgency mapping for ophthalmic conditions
const SEVERITY_MAP = {
  // EMERGENCY - Immediate action required (0-2 hours)
  'H33': { level: 'EMERGENCY', color: '#dc3545', action: 'URGENT_RETINA_REFERRAL', timeframe: 'Within 2 hours', priority: 1 },
  'H34': { level: 'EMERGENCY', color: '#dc3545', action: 'URGENT_RETINA_REFERRAL', timeframe: 'Within 2 hours', priority: 1 },
  'H44.0': { level: 'EMERGENCY', color: '#dc3545', action: 'URGENT_HOSPITAL_REFERRAL', timeframe: 'Immediate', priority: 1 },
  'H40.2': { level: 'EMERGENCY', color: '#dc3545', action: 'URGENT_GLAUCOMA_MANAGEMENT', timeframe: 'Within 1 hour', priority: 1 },
  'S05': { level: 'EMERGENCY', color: '#dc3545', action: 'URGENT_TRAUMA_CARE', timeframe: 'Immediate', priority: 1 },
  
  // URGENT - Same day management (2-6 hours)
  'H16': { level: 'URGENT', color: '#fd7e14', action: 'SAME_DAY_REVIEW', timeframe: 'Within 6 hours', priority: 2 },
  'H43.1': { level: 'URGENT', color: '#fd7e14', action: 'RETINA_REVIEW_URGENT', timeframe: 'Within 12 hours', priority: 2 },
  'H27': { level: 'URGENT', color: '#fd7e14', action: 'SPECIALIST_REVIEW', timeframe: 'Within 24 hours', priority: 2 },
  
  // HIGH_PRIORITY - Within 1 week
  'H35.3': { level: 'HIGH_PRIORITY', color: '#ffc107', action: 'RETINA_SPECIALIST', timeframe: 'Within 1 week', priority: 3 },
  'H40': { level: 'HIGH_PRIORITY', color: '#ffc107', action: 'GLAUCOMA_MONITORING', timeframe: 'Within 2 weeks', priority: 3 },
  'H35': { level: 'HIGH_PRIORITY', color: '#ffc107', action: 'RETINA_REVIEW', timeframe: 'Within 1 week', priority: 3 },
  
  // ROUTINE - Elective management (weeks to months)
  'H25': { level: 'ROUTINE', color: '#28a745', action: 'ELECTIVE_SURGERY', timeframe: 'Within 3 months', priority: 4 },
  'H26': { level: 'ROUTINE', color: '#28a745', action: 'ELECTIVE_SURGERY', timeframe: 'Within 3 months', priority: 4 },
  'H52': { level: 'ROUTINE', color: '#28a745', action: 'REFRACTION_CORRECTION', timeframe: 'Routine follow-up', priority: 5 },
  'H53': { level: 'ROUTINE', color: '#28a745', action: 'ROUTINE_MANAGEMENT', timeframe: 'Routine follow-up', priority: 5 }
};

function Consultation() {
  const [user] = useState(() => authStore.getUser());
  
  // State
  const [queue, setQueue] = useState([]);
  const [icdMaster, setICDMaster] = useState([]);
  const [selectedICDs, setSelectedICDs] = useState([]);
  const [patientHistory, setPatientHistory] = useState([]);
  const [consultationId, setConsultationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAISummary, setShowAISummary] = useState(false);
  const [aiFeedbackSubmitted, setAiFeedbackSubmitted] = useState(false);
  const [aiStructuredData, setAiStructuredData] = useState(null);
  const [emergencyAlert, setEmergencyAlert] = useState(null);

  // Form data
  const [patientData, setPatientData] = useState({
    uhid: '',
    serial_no: '',
    name: '',
    gender: '',
    age: '',
    phone: '',
    opd_id: null
  });

  const [clinicalNotes, setClinicalNotes] = useState({
    diagnosis: '',
    treatment_plan: '',
    followup_instructions: ''
  });

  // Load initial data
  useEffect(() => {
    if (user?.role === 'DOCTOR') {
      // Use doctor_id from user object (linked via users.doctor_id -> doctors.id)
      const doctorId = user.doctor_id;
      
      if (!doctorId) {
        console.error('Doctor user account is not linked to a doctor profile. Please contact administrator.');
        return;
      }
      
      fetchTodayQueue(doctorId);
      fetchICDCodes();
    }
  }, [user]);

  // Update AI structured data and emergency alerts when AI summary is shown
  useEffect(() => {
    if (!showAISummary) {
      setAiStructuredData(null);
      setEmergencyAlert(null);
      return;
    }

    // Only generate if patient loaded and ICD codes selected
    if (!patientData.uhid || selectedICDs.length === 0) {
      setAiStructuredData(null);
      setEmergencyAlert(null);
      return;
    }

    const age = parseInt(patientData.age) || 0;
    const primaryICD = selectedICDs[0];
    const severityInfo = getSeverityInfo(primaryICD?.icd_code);
    const currentDiagnosis = clinicalNotes.diagnosis.trim();
    const hasHistory = patientHistory.length > 0;

    // Generate structured data
    const structuredData = {
      patient: {
        uhid: patientData.uhid,
        name: patientData.name,
        age: age,
        gender: patientData.gender
      },
      condition: {
        icd_code: primaryICD?.icd_code || 'UNSPECIFIED',
        description: primaryICD?.description || currentDiagnosis,
        severity: severityInfo.level,
        priority: severityInfo.priority
      },
      recommendation: {
        action: severityInfo.action,
        urgency: severityInfo.level,
        timeframe: severityInfo.timeframe
      },
      clinical_notes: {
        diagnosis: currentDiagnosis,
        treatment_plan: clinicalNotes.treatment_plan,
        followup_instructions: clinicalNotes.followup_instructions
      },
      history: {
        has_previous: hasHistory,
        consultation_count: patientHistory.length,
        last_visit: hasHistory ? patientHistory[0]?.created_at : null
      },
      red_flags: [],
      follow_up_days: severityInfo.priority === 1 ? 1 : severityInfo.priority === 2 ? 3 : severityInfo.priority === 3 ? 14 : 30,
      ai_version: 'v2.0',
      generated_at: new Date().toISOString()
    };

    // Set emergency alert
    let alert = null;
    if (severityInfo.level === 'EMERGENCY') {
      alert = {
        level: 'EMERGENCY',
        message: `🚨 URGENT: ${primaryICD?.description || currentDiagnosis}`,
        action: severityInfo.action,
        timeframe: severityInfo.timeframe,
        color: severityInfo.color
      };
      structuredData.red_flags.push(alert.message);
    } else if (severityInfo.level === 'URGENT') {
      alert = {
        level: 'URGENT',
        message: `⚠️ URGENT: ${primaryICD?.description || currentDiagnosis}`,
        action: severityInfo.action,
        timeframe: severityInfo.timeframe,
        color: severityInfo.color
      };
      structuredData.red_flags.push(alert.message);
    }

    setAiStructuredData(structuredData);
    setEmergencyAlert(alert);
  }, [showAISummary, patientData.uhid, selectedICDs, clinicalNotes.diagnosis, patientHistory]);

  const fetchTodayQueue = async (doctorId) => {
    try {
      const response = await getTodayOPDQueue(doctorId);
      const queueData = response.data || [];
      setQueue(queueData);
    } catch (error) {
      console.error('Failed to load OPD queue:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const fetchICDCodes = async () => {
    try {
      const response = await getICDCodes();
      setICDMaster(response.icd_codes || []);
    } catch (error) {
      console.error('Failed to load ICD codes:', error);
    }
  };

  const fetchPatientHistory = async (uhid) => {
    try {
      const response = await getPatientConsultations(uhid);
      setPatientHistory(response.data || []);
    } catch (error) {
      console.error('Failed to load patient history:', error);
      setPatientHistory([]);
    }
  };

  const loadPatientFromQueue = async (queueEntry) => {
    setPatientData({
      uhid: queueEntry.uhid,
      serial_no: queueEntry.serial_no,
      name: `${queueEntry.first_name || ''} ${queueEntry.last_name || ''}`.trim(),
      gender: queueEntry.gender || '',
      age: queueEntry.age ? String(queueEntry.age) : '',
      phone: queueEntry.phone || '',
      opd_id: queueEntry.id
    });

    // Clear clinical notes for new patient
    setClinicalNotes({
      diagnosis: '',
      treatment_plan: '',
      followup_instructions: ''
    });
    setSelectedICDs([]);
    setConsultationId(null);

    // Fetch patient history
    fetchPatientHistory(queueEntry.uhid);

    // Update queue status to IN_PROGRESS
    await updateQueueStatus(queueEntry.id, 'IN_PROGRESS');
  };

  const updateQueueStatus = async (queueId, status) => {
    try {
      // Update backend first
      await updateOPDStatus(queueId, status);
      
      // Then update local state
      setQueue(prevQueue =>
        prevQueue.map(entry =>
          entry.id === queueId ? { ...entry, status } : entry
        )
      );
    } catch (error) {
      console.error('Failed to update queue status:', error);
      // Still update local state even if API fails
      setQueue(prevQueue =>
        prevQueue.map(entry =>
          entry.id === queueId ? { ...entry, status } : entry
        )
      );
    }
  };

  const handleICDSelect = (e) => {
    const options = Array.from(e.target.selectedOptions);
    const selected = options.map(opt => {
      const icd = icdMaster.find(i => i.id === parseInt(opt.value));
      return { id: icd.id, icd_code: icd.icd_code, description: icd.description };
    });
    setSelectedICDs(selected);
  };

  const handleUpdate = async () => {
    if (!patientData.uhid) {
      alert('Please load a patient first');
      return;
    }

    if (!clinicalNotes.diagnosis.trim()) {
      alert('Please enter diagnosis');
      return;
    }

    setLoading(true);
    try {
      let consultation;

      // Map user IDs to doctor IDs
      let doctorId = 1; // Default to Dr Aditya
      if (user.id === 2) {
        doctorId = 1; // dr.aditya -> Dr Aditya
      } else if (user.id === 6) {
        doctorId = 1; // doctor -> Dr Aditya
      }

      if (!consultationId) {
        // Create new consultation
        const consultData = {
          uhid: patientData.uhid,
          doctor_id: doctorId,
          opd_id: patientData.opd_id,
          diagnosis: clinicalNotes.diagnosis,
          treatment_plan: clinicalNotes.treatment_plan,
          followup_instructions: clinicalNotes.followup_instructions
        };

        const response = await createConsultation(consultData);
        consultation = response.consultation;
        setConsultationId(consultation.id);

        // Add ICD codes
        for (const icd of selectedICDs) {
          await addICDCode(consultation.id, icd.id);
        }
      } else {
        // Update existing consultation
        const response = await updateConsultation(consultationId, clinicalNotes);
        consultation = response.consultation;
      }

      // Update queue status to COMPLETED
      await updateQueueStatus(patientData.opd_id, 'COMPLETED');

      alert('Consultation saved successfully');
      clearForm();
    } catch (error) {
      console.error('Failed to save consultation:', error);
      alert('Failed to save consultation: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setPatientData({
      uhid: '',
      serial_no: '',
      name: '',
      gender: '',
      age: '',
      phone: '',
      opd_id: null
    });
    setClinicalNotes({
      diagnosis: '',
      treatment_plan: '',
      followup_instructions: ''
    });
    setSelectedICDs([]);
    setPatientHistory([]);
    setConsultationId(null);
    setShowAISummary(false);
    setAiFeedbackSubmitted(false);
  };

  const submitAIFeedback = async (feedbackType) => {
    try {
      const token = localStorage.getItem('token');
      
      // Generate the current AI protocol to save
      const aiProtocolText = generateAISummary();
      
      const response = await fetch('http://localhost:3000/api/v1/consultations/ai-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          consultation_id: consultationId,
          diagnosis: clinicalNotes.diagnosis,
          icd_codes: selectedICDs.map(icd => icd.icd_code),
          ai_protocol_text: aiProtocolText, // Save the complete AI recommendation
          patient_age: parseInt(patientData.age) || null,
          patient_gender: patientData.gender || null,
          feedback_type: feedbackType
        })
      });

      if (response.ok) {
        setAiFeedbackSubmitted(true);
        console.log('AI feedback submitted:', feedbackType);
        console.log('Protocol saved for training:', aiProtocolText.substring(0, 100) + '...');
      }
    } catch (error) {
      console.error('Failed to submit AI feedback:', error);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'WAITING': return 'status-waiting';
      case 'IN_PROGRESS': return 'status-progress';
      case 'COMPLETED': return 'status-done';
      default: return '';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSeverityInfo = (icdCode) => {
    if (!icdCode) return null;
    
    // Check exact match first
    if (SEVERITY_MAP[icdCode]) return SEVERITY_MAP[icdCode];
    
    // Check prefix match (H33.0 matches H33)
    for (const [key, value] of Object.entries(SEVERITY_MAP)) {
      if (icdCode.startsWith(key)) return value;
    }
    
    return { level: 'ROUTINE', color: '#6c757d', action: 'STANDARD_CARE', timeframe: 'As needed', priority: 5 };
  };

  const generateAISummary = () => {
    if (!patientData.uhid) {
      return 'Load a patient to see AI-generated recommendations.';
    }

    const hasHistory = patientHistory.length > 0;
    const currentDiagnosis = clinicalNotes.diagnosis.trim();
    const age = parseInt(patientData.age) || 0;
    const primaryICD = selectedICDs[0];

    if (!primaryICD && !currentDiagnosis) {
      return 'Enter diagnosis and select ICD codes to generate AI recommendations.';
    }

    // Get severity information
    const severityInfo = getSeverityInfo(primaryICD?.icd_code);

    let protocol = `══════════════════════════════════════════════════════\n`;
    protocol += `   AI-RECOMMENDED TREATMENT PROTOCOL\n`;
    protocol += `══════════════════════════════════════════════════════\n\n`;
    protocol += `Patient: ${patientData.name} | Age: ${age} yrs | Gender: ${patientData.gender}\n`;
    
    if (primaryICD) {
      protocol += `Primary ICD: ${primaryICD.icd_code} — ${primaryICD.description}\n`;
      protocol += `\n🏷️  SEVERITY: ${severityInfo.level}\n`;
      protocol += `⏰  TIMEFRAME: ${severityInfo.timeframe}\n`;
      protocol += `📋  RECOMMENDED ACTION: ${severityInfo.action.replace(/_/g, ' ')}\n`;
    }
    protocol += `\n⚠️  This recommendation is generated based on patient age, symptoms, and clinical guidelines.\n`;
    protocol += `    Final decision rests with the treating ophthalmologist.\n\n`;
    protocol += `──────────────────────────────────────────────────────\n\n`;

    // Generate condition-specific protocol
    const icdCode = primaryICD?.icd_code || '';
    
    if (icdCode.startsWith('H33')) {
      // Retinal Detachment - EMERGENCY
      protocol += generateRetinalDetachmentProtocol(age, icdCode, primaryICD?.description);
    } else if (icdCode.startsWith('H34')) {
      // Retinal Vascular Occlusion - EMERGENCY
      protocol += generateRetinalVascularProtocol(age, icdCode, primaryICD?.description);
    } else if (icdCode.startsWith('H44.0')) {
      // Endophthalmitis - EMERGENCY
      protocol += generateEndophthalmitisProtocol(age, icdCode, primaryICD?.description);
    } else if (icdCode === 'H40.2') {
      // Acute Angle Closure - EMERGENCY
      protocol += generateAcuteGlaucomaProtocol(age, icdCode, primaryICD?.description);
    } else if (icdCode.startsWith('H16')) {
      // Corneal Ulcer/Keratitis - URGENT
      protocol += generateCornealUlcerProtocol(age, icdCode, primaryICD?.description);
    } else if (icdCode.startsWith('H25') || icdCode.startsWith('H26')) {
      // Cataract protocols
      protocol += generateCataractProtocol(age, icdCode, primaryICD?.description);
    } else if (icdCode.startsWith('H40')) {
      // Glaucoma protocols (chronic)
      protocol += generateGlaucomaProtocol(age, icdCode, primaryICD?.description);
    } else if (icdCode.startsWith('H52')) {
      // Refractive error protocols
      protocol += generateRefractiveProtocol(age, icdCode, primaryICD?.description);
    } else if (icdCode.startsWith('H53')) {
      // Visual disturbance protocols
      protocol += generateVisualDisturbanceProtocol(age, icdCode);
    } else {
      // Generic protocol
      protocol += generateGenericProtocol(age, currentDiagnosis);
    }

    // Add patient history context
    if (hasHistory) {
      protocol += `\n──────────────────────────────────────────────────────\n`;
      protocol += `📋 PATIENT HISTORY CONTEXT\n\n`;
      protocol += `Previous consultations: ${patientHistory.length}\n`;
      const lastVisit = patientHistory[0];
      if (lastVisit) {
        protocol += `Last visit: ${formatDate(lastVisit.created_at)}\n`;
        protocol += `Previous diagnosis: ${lastVisit.diagnosis?.substring(0, 80) || 'Not recorded'}\n`;
        protocol += `\n⚕️  AI Note: Review treatment continuity and response to previous therapy.\n`;
      }
    }

    protocol += `\n──────────────────────────────────────────────────────\n`;
    protocol += `🤖 AI Confidence Level: ${selectedICDs.length > 0 ? 'HIGH' : 'MEDIUM'} (based on data completeness)\n`;
    protocol += `📊 Structured Data: Available for API/ML processing\n`;
    protocol += `Generated: ${new Date().toLocaleString('en-IN')}\n`;

    return protocol;
  };

  // EMERGENCY PROTOCOLS

  const generateRetinalDetachmentProtocol = (age, icdCode, description) => {
    return `🚨🚨🚨 EMERGENCY PROTOCOL - RETINAL DETACHMENT 🚨🚨🚨\n\n`
    + `1️⃣  IMMEDIATE ASSESSMENT\n\n`
    + `   URGENT SYMPTOMS TO VERIFY:\n`
    + `   • Sudden onset floaters (like "cobwebs" or "rain")\n`
    + `   • Flashing lights (photopsia)\n`
    + `   • Shadow/curtain in peripheral or central vision\n`
    + `   • Reduced visual acuity\n\n`
    + `   CRITICAL EXAMINATION:\n`
    + `   ✓ Dilated fundus exam to confirm detachment\n`
    + `   ✓ Document extent: Macula ON vs Macula OFF\n`
    + `   ✓ Identify retinal breaks/tears\n`
    + `   ✓ Check fellow eye (10-15% bilateral risk)\n\n`
    + `   ⚠️  MACULA-OFF DETACHMENT:\n`
    + `       Every hour delays treatment = worse visual prognosis\n`
    + `       Surgery within 24-48 hours critical\n\n`
    + `──────────────────────────────────────────────────────\n\n`
    + `2️⃣  EMERGENCY MANAGEMENT\n\n`
    + `   IMMEDIATE ACTIONS (Do NOT delay):\n`
    + `   🚨 URGENT RETINA SPECIALIST REFERRAL (within 2 hours)\n`
    + `   🚨 Advise STRICT bed rest with head positioning\n`
    + `   🚨 Position: Head elevated, avoid affected side\n`
    + `   🚨 NO straining, bending, heavy lifting\n`
    + `   🚨 NPO (nil per oral) if surgery likely today\n\n`
    + `   CONTRAINDICATIONS:\n`
    + `   ❌ DO NOT dilate again before surgical eval\n`
    + `   ❌ NO air travel until repaired\n`
    + `   ❌ Avoid any Valsalva maneuvers\n\n`
    + `──────────────────────────────────────────────────────\n\n`
    + `3️⃣  SURGICAL OPTIONS (Retina Surgeon Decision)\n\n`
    + `   • Pneumatic Retinopexy (if superior break, selected cases)\n`
    + `   • Scleral Buckle\n`
    + `   • Pars Plana Vitrectomy (PPV) + Gas/Silicone Oil\n`
    + `   • Combined procedures if complex\n\n`
    + `   Expected Outcome:\n`
    + `   - Macula-ON: 90-95% visual recovery\n`
    + `   - Macula-OFF <7 days: 60-80% functional vision\n`
    + `   - Macula-OFF >7 days: Significantly reduced prognosis\n\n`
    + `──────────────────────────────────────────────────────\n\n`
    + `4️⃣  PATIENT COUNSELING (CRITICAL)\n\n`
    + `   🚨 THIS IS A SIGHT-THREATENING EMERGENCY\n`
    + `   🚨 Requires urgent surgical repair\n`
    + `   🚨 Delay may result in PERMANENT vision loss\n`
    + `   🚨 Arrange immediate transport to retina center\n\n`
    + `──────────────────────────────────────────────────────\n\n`
    + `5️⃣  RED-FLAG DOCUMENTATION\n\n`
    + `   • Time of symptom onset: ___________\n`
    + `   • Macula status: ON / OFF\n`
    + `   • Referral time: ___________\n`
    + `   • Retina surgeon contacted: YES / NO\n`
    + `   • Patient counseled on urgency: YES / NO\n\n`;
  };

  const generateRetinalVascularProtocol = (age, icdCode, description) => {
    return `🚨🚨 EMERGENCY - RETINAL VASCULAR OCCLUSION 🚨🚨\n\n`
    + `1️⃣  RAPID ASSESSMENT\n\n`
    + `   Type Classification:\n`
    + `   • CRAO (Central Retinal Artery Occlusion) - TRUE EMERGENCY\n`
    + `   • BRAO (Branch Retinal Artery Occlusion)\n`
    + `   • CRVO (Central Retinal Vein Occlusion)\n`
    + `   • BRVO (Branch Retinal Vein Occlusion)\n\n`
    + `   CRITICAL TIMING:\n`
    + `   ⏰ CRAO: "Eye stroke" - Permanent damage after 90-100 minutes\n`
    + `   ⏰ Treatment window: Within 4-6 hours (best outcomes)\n\n`
    + `──────────────────────────────────────────────────────\n\n`
    + `2️⃣  EMERGENCY MANAGEMENT (CRAO)\n\n`
    + `   IMMEDIATE ACTIONS (First 2 hours):\n`
    + `   🚨 Ocular massage (firm pressure on closed eye, 5-15 sec cycles)\n`
    + `   🚨 Lower IOP: Anterior chamber paracentesis if trained\n`
    + `   🚨 Carbogen inhalation (95% O2 + 5% CO2) if available\n`
    + `   🚨 Systemic: Aspirin 300mg STAT\n`
    + `   🚨 URGENT ophthalmology/retina referral\n\n`
    + `   Additional Measures:\n`
    + `   • IOP-lowering: Acetazolamide 500mg IV\n`
    + `   • Anterior chamber paracentesis (release 0.1-0.2ml aqueous)\n`
    + `   • Rule out giant cell arteritis (ESR, CRP)\n\n`
    + `──────────────────────────────────────────────────────\n\n`
    + `3️⃣  VEIN OCCLUSION MANAGEMENT\n\n`
    + `   CRVO/BRVO (not immediately sight-threatening but urgent):\n`
    + `   • Retina referral within 24-48 hours\n`
    + `   • Monitor for neovascularization\n`
    + `   • Consider anti-VEGF injections\n`
    + `   • Screen for systemic vascular risk factors\n\n`
    + `──────────────────────────────────────────────────────\n\n`
    + `4️⃣  SYSTEMIC WORKUP (Essential)\n\n`
    + `   Immediate Labs:\n`
    + `   • Blood pressure\n`
    + `   • Blood glucose / HbA1c\n`
    + `   • Lipid profile\n`
    + `   • ESR/CRP (rule out arteritis if age >50)\n`
    + `   • Carotid Doppler\n`
    + `   • ECG + Echo (embolic source)\n\n`;
  };

  const generateEndophthalmitisProtocol = (age, icdCode, description) => {
    return `🚨🚨🚨 EMERGENCY - ENDOPHTHALMITIS 🚨🚨🚨\n\n`
    + `1️⃣  CRITICAL RECOGNITION\n\n`
    + `   Classic Presentation (Post-op):\n`
    + `   • Severe eye pain (sudden onset)\n`
    + `   • Marked vision loss\n`
    + `   • Red eye with lid swelling\n`
    + `   • Hypopyon (layered pus in anterior chamber)\n`
    + `   • Vitritis (hazy fundus view)\n\n`
    + `   Timing:\n`
    + `   • Acute: 2-7 days post-op (bacterial)\n`
    + `   • Delayed: 2-6 weeks (fungal/low-virulence)\n\n`
    + `──────────────────────────────────────────────────────\n\n`
    + `2️⃣  EMERGENCY MANAGEMENT\n\n`
    + `   🚨 IMMEDIATE ACTIONS (Do NOT delay):\n`
    + `   • Urgent ophthalmology referral (within 1 hour)\n`
    + `   • Arrange IMMEDIATE vitreous tap & inject\n`
    + `   • Do NOT start topical steroids before cultures\n\n`
    + `   Standard Treatment Protocol:\n`
    + `   1. Vitreous Tap (diagnostic)\n`
    + `      - Send for culture & sensitivity\n`
    + `      - Gram stain, bacterial/fungal culture\n\n`
    + `   2. Intravitreal Antibiotics (therapeutic)\n`
    + `      - Vancomycin 1mg/0.1ml (Gram +ve)\n`
    + `      - Ceftazidime 2.25mg/0.1ml (Gram -ve)\n`
    + `      - Consider Amphotericin B if fungal suspected\n\n`
    + `   3. Adjunctive Therapy:\n`
    + `      - Topical fortified antibiotics (Vancomycin + Ceftazidime)\n`
    + `      - Cycloplegic (Atropine 1%)\n`
    + `      - Consider systemic antibiotics (controversial)\n\n`
    + `──────────────────────────────────────────────────────\n\n`
    + `3️⃣  VITRECTOMY INDICATIONS\n\n`
    + `   Consider PPV if:\n`
    + `   • Vision: Light perception or worse\n`
    + `   • Severe vitritis obscuring fundus\n`
    + `   • No improvement after 24-48 hours of intravitreal therapy\n\n`
    + `──────────────────────────────────────────────────────\n\n`
    + `4️⃣  PROGNOSIS & COUNSELING\n\n`
    + `   🚨 This is a VISION-THREATENING INFECTION\n`
    + `   • Early treatment (within 24 hours): Better outcomes\n`
    + `   • Delayed treatment: High risk of permanent vision loss\n`
    + `   • Possible outcomes: 20/40 to No Light Perception\n`
    + `   • May require multiple interventions\n\n`;
  };

  const generateAcuteGlaucomaProtocol = (age, icdCode, description) => {
    return `🚨🚨 EMERGENCY - ACUTE ANGLE CLOSURE GLAUCOMA 🚨🚨\n\n`
    + `1️⃣  CLINICAL RECOGNITION\n\n`
    + `   Classic Triad:\n`
    + `   • Severe eye pain (+ headache, nausea, vomiting)\n`
    + `   • Blurred vision with halos around lights\n`
    + `   • Red eye\n\n`
    + `   Examination Findings:\n`
    + `   • IOP typically >40 mmHg (may be >60)\n`
    + `   • Corneal edema (cloudy)\n`
    + `   • Mid-dilated, non-reactive pupil\n`
    + `   • Shallow anterior chamber\n`
    + `   • Closed angle on gonioscopy\n\n`
    + `──────────────────────────────────────────────────────\n\n`
    + `2️⃣  EMERGENCY IOP-LOWERING REGIMEN\n\n`
    + `   IMMEDIATE TREATMENT (ALL simultaneously):\n\n`
    + `   A. TOPICAL (Start immediately):\n`
    + `      • Pilocarpine 2% (every 15 min x 2, then hourly)\n`
    + `        ⚠️  Only AFTER IOP <40 (ischemic iris won't respond)\n`
    + `      • Timolol 0.5% (twice)\n`
    + `      • Apraclonidine 1% or Brimonidine 0.2%\n`
    + `      • Prednisolone acetate 1% (hourly)\n\n`
    + `   B. SYSTEMIC (Critical for rapid IOP reduction):\n`
    + `      • Acetazolamide 500mg IV (or 500mg PO if IV unavailable)\n`
    + `      • Mannitol 20% IV (1-2 g/kg over 45 min) if IOP >50\n`
    + `      • Glycerol 50% oral (if Mannitol unavailable, 1-1.5g/kg)\n\n`
    + `   C. ANALGESIA:\n`
    + `      • Severe pain requires IV analgesia\n`
    + `      • Anti-emetic if vomiting\n\n`
    + `──────────────────────────────────────────────────────\n\n`
    + `3️⃣  DEFINITIVE MANAGEMENT\n\n`
    + `   After IOP Control:\n`
    + `   🚨 URGENT Laser Peripheral Iridotomy (LPI)\n`
    + `      - Perform within 24 hours\n`
    + `      - Breaks the pupillary block\n`
    + `      - Curative if angle not permanently damaged\n\n`
    + `   Fellow Eye:\n`
    + `   ⚠️  PROPHYLACTIC LPI required in fellow eye\n`
    + `       (40-80% risk of acute attack within 5 years)\n\n`
    + `──────────────────────────────────────────────────────\n\n`
    + `4️⃣  MONITORING & FOLLOW-UP\n\n`
    + `   Acute Phase:\n`
    + `   • Recheck IOP every 1 hour until <30 mmHg\n`
    + `   • Monitor for corneal decompensation\n`
    + `   • Gonioscopy after corneal clearing\n\n`
    + `   Post-LPI:\n`
    + `   • Day 1: Check IOP, patency of iridotomy\n`
    + `   • Week 1: Gonioscopy to confirm angle opening\n`
    + `   • Long-term: Risk of chronic angle damage\n\n`
    + `──────────────────────────────────────────────────────\n\n`
    + `5️⃣  RED FLAGS\n\n`
    + `   🚨 IOP not responding after 2 hours → Consider surgery\n`
    + `   🚨 Corneal decompensation → May need penetrating keratoplasty\n`
    + `   🚨 Permanent angle closure → Chronic glaucoma management\n\n`;
  };

  const generateCornealUlcerProtocol = (age, icdCode, description) => {
    return `⚠️⚠️ URGENT - CORNEAL ULCER / KERATITIS ⚠️⚠️\n\n`
    + `1️⃣  CLINICAL ASSESSMENT\n\n`
    + `   Key Features:\n`
    + `   • Painful red eye\n`
    + `   • Photophobia, tearing\n`
    + `   • Corneal infiltrate with overlying epithelial defect\n`
    + `   • Vision may be reduced\n\n`
    + `   Slit-lamp Examination:\n`
    + `   ✓ Size, depth, location of ulcer\n`
    + `   ✓ Hypopyon (if present → severe infection)\n`
    + `   ✓ Anterior chamber reaction\n`
    + `   ✓ Fluorescein staining (epithelial defect)\n\n`
    + `──────────────────────────────────────────────────────\n\n`
    + `2️⃣  URGENT MANAGEMENT\n\n`
    + `   SAME-DAY TREATMENT (Do NOT delay):\n\n`
    + `   A. CORNEAL SCRAPING (if moderate-severe):\n`
    + `      • Before starting antibiotics\n`
    + `      • Send for Gram stain, KOH, culture\n\n`
    + `   B. EMPIRIC FORTIFIED ANTIBIOTICS:\n`
    + `      Bacterial (most common):\n`
    + `      • Fortified Vancomycin 50mg/ml (Gram +ve)\n`
    + `        Loading: Every 30 min x 4, then hourly\n`
    + `      • Fortified Ceftazidime 50mg/ml (Gram -ve)\n`
    + `        Loading: Every 30 min x 4, then hourly\n\n`
    + `      Alternative (if fortified unavailable):\n`
    + `      • Moxifloxacin 0.5% hourly\n\n`
    + `   C. ADJUNCTIVE:\n`
    + `      • Cycloplegic: Atropine 1% or Homatropine 2% TDS\n`
    + `      • NO steroid initially (worsens infection)\n`
    + `      • Consider bandage contact lens if refractory\n\n`
    + `──────────────────────────────────────────────────────\n\n`
    + `3️⃣  SPECIAL CONSIDERATIONS\n\n`
    + `   Fungal Keratitis (if suspected):\n`
    + `   • History: Vegetable trauma, contact lens\n`
    + `   • Feathery infiltrate, satellite lesions\n`
    + `   • Treatment: Natamycin 5% hourly\n\n`
    + `   Acanthamoeba (contact lens wearers):\n`
    + `   • Severe pain out of proportion\n`
    + `   • Ring infiltrate\n`
    + `   • Treatment: PHMB + Chlorhexidine (both hourly)\n\n`
    + `──────────────────────────────────────────────────────\n\n`
    + `4️⃣  MONITORING & FOLLOW-UP\n\n`
    + `   Critical Follow-up Schedule:\n`
    + `   • Day 1-2: Daily review (assess response)\n`
    + `   • Day 3: If worse → adjust antibiotics per culture\n`
    + `   • Week 1: Healing should be evident\n\n`
    + `   Surgical Options (if medical failure):\n`
    + `   • Therapeutic penetrating keratoplasty\n`
    + `   • Conjunctival flap\n`
    + `   • Amniotic membrane transplant\n\n`
    + `──────────────────────────────────────────────────────\n\n`
    + `5️⃣  RED FLAGS FOR URGENT REFERRAL\n\n`
    + `   🚨 Central ulcer threatening visual axis\n`
    + `   🚨 Descemetocele or impending perforation\n`
    + `   🚨 No response after 48 hours of treatment\n`
    + `   🚨 Progressive thinning\n`
    + `   🚨 Hypopyon increasing\n\n`;
  };

  const generateCataractProtocol = (age, icdCode, description) => {
    return `1️⃣  CLINICAL ASSESSMENT (AI Checks First)
   • Gradual, painless reduction in distance vision
   • Difficulty with night driving / glare sensitivity
   • Nuclear/cortical sclerosis on slit-lamp exam
   • No acute pain, redness, or inflammation
   • Retina view assessable for fundus examination

AI Confidence Level: High (typical age-related cataract presentation)

──────────────────────────────────────────────────────

2️⃣  PRIMARY RECOMMENDATION

Definitive Treatment: CATARACT SURGERY

Suggested Procedure:
   • Phacoemulsification with Posterior Chamber IOL implantation

Rationale (AI Logic):
   • ${age > 50 ? 'Age-related' : 'Early-onset'} cataract does not regress with medication
   • Surgery offers predictable and permanent visual improvement
   • Delaying surgery may increase lens hardness and surgical difficulty

──────────────────────────────────────────────────────

3️⃣  PRE-SURGICAL OPTIMIZATION (Before Surgery)

AI suggests ordering:
   ✓ Biometry (IOL power calculation - SRK/T or Barrett formula)
   ✓ Keratometry / Corneal topography
   ✓ Dilated fundus examination
   ✓ Basic systemic fitness assessment:
      - Blood Pressure check
      - Random Blood Sugar (if diabetic history)
      - ECG (if age >60 or cardiac history)

If Comorbidities Present:
   ⚠️  Optimize diabetes/hypertension before surgery
   ⚠️  Control intraocular inflammation if present

──────────────────────────────────────────────────────

4️⃣  INTERIM / SUPPORTIVE MANAGEMENT (If Surgery Deferred)

If patient chooses to wait or surgery temporarily deferred:
   • Update distance spectacles (temporary measure)
   • Counsel on:
      - Use adequate lighting for reading
      - Avoid night driving if glare severe
      - Consider UV-protective sunglasses outdoors
   • Lubricating eye drops if associated dryness

⚠️  AI Note: No eye drops can reverse cataract formation.

──────────────────────────────────────────────────────

5️⃣  POST-SURGICAL CARE (Standard Protocol)

AI-recommended post-op regimen:
   Week 1-2:
      • Topical antibiotic + steroid combination (4x/day)
      • NSAID eye drops (2x/day) for CME prevention
      • Eye shield at night for 1 week
      • Avoid eye rubbing, heavy lifting, water splash

   Week 3-4:
      • Taper steroids gradually (3x, 2x, 1x, stop)
      • Continue NSAID if needed

──────────────────────────────────────────────────────

6️⃣  FOLLOW-UP SCHEDULE (AI Suggested)

   Day 1:    Wound check, IOP measurement, corneal clarity
   Week 1:   Vision improvement assessment, inflammation check
   Week 4-6: Final refraction and spectacle prescription

──────────────────────────────────────────────────────

7️⃣  RED-FLAG ALERTS (AI Auto-Warnings)

Advise IMMEDIATE review if patient reports:
   🚨 Sudden drop in vision post-surgery
   🚨 Increasing pain or redness
   🚨 Excessive watering or purulent discharge
   🚨 New onset flashes or floaters (rule out retinal issues)
   🚨 Persistent IOP elevation

──────────────────────────────────────────────────────

8️⃣  AI SUMMARY FOR DOCTOR DASHBOARD

Findings consistent with ${description}. Cataract surgery (Phaco + IOL) 
recommended. Expected visual prognosis: GOOD with timely intervention.
Estimated recovery time: 4-6 weeks for complete visual rehabilitation.`;
  };

  const generateGlaucomaProtocol = (age, icdCode, description) => {
    return `1️⃣  CLINICAL ASSESSMENT

   • Elevated intraocular pressure (IOP >21 mmHg)
   • Optic disc cupping (C/D ratio assessment)
   • Visual field defects on perimetry
   • Angle assessment via gonioscopy

AI Confidence: High (glaucoma suspect/confirmed)

──────────────────────────────────────────────────────

2️⃣  PRIMARY TREATMENT STRATEGY

Medical Management (First-line):
   • Topical prostaglandin analogs (Latanoprost/Travoprost)
      - Target: Reduce IOP by 20-30%
      - Timing: Once daily at bedtime

Alternative/Additional:
   • Beta-blockers (Timolol 0.5%) if PG insufficient
   • Carbonic anhydrase inhibitors (Dorzolamide)
   • Alpha-agonists (Brimonidine)

⚠️  AI Note: Target IOP varies; aim for individualized pressure.

──────────────────────────────────────────────────────

3️⃣  MONITORING PROTOCOL

Baseline Studies Required:
   ✓ IOP measurement (multiple readings)
   ✓ Optic disc photography/OCT
   ✓ Visual field testing (Humphrey 24-2 or 30-2)
   ✓ Pachymetry (central corneal thickness)

Follow-up Frequency:
   • Initial: Every 2-4 weeks until IOP controlled
   • Maintenance: Every 3-6 months with VF/OCT annually

──────────────────────────────────────────────────────

4️⃣  SURGICAL OPTIONS (If Medical Failure)

Consider if:
   • IOP not controlled on maximum tolerated medications
   • Progressive visual field loss despite treatment
   • Non-compliance or medication intolerance

Procedures (AI ranked by invasiveness):
   1. Selective Laser Trabeculoplasty (SLT)
   2. Trabeculectomy with MMC
   3. Glaucoma drainage devices (Ahmed/Baerveldt)

──────────────────────────────────────────────────────

5️⃣  PATIENT COUNSELING (AI Emphasized)

Critical Points:
   • Glaucoma is chronic; requires lifelong management
   • Vision loss is irreversible but progression preventable
   • Medication compliance is ESSENTIAL
   • Regular follow-up mandatory

──────────────────────────────────────────────────────

6️⃣  RED-FLAG SYMPTOMS

Urgent review needed if:
   🚨 Sudden severe eye pain (acute angle closure?)
   🚨 Rapid vision deterioration
   🚨 Persistent headaches with blurred vision
   🚨 IOP >30 mmHg despite treatment`;
  };

  const generateRefractiveProtocol = (age, icdCode, description) => {
    return `1️⃣  REFRACTIVE ERROR ASSESSMENT

Condition: ${description}
Age Group: ${age < 18 ? 'Pediatric' : age < 40 ? 'Young Adult' : 'Presbyopic Range'}

──────────────────────────────────────────────────────

2️⃣  RECOMMENDED CORRECTION

Primary Options:
   ${age < 18 ? 
     '• Spectacles (preferred for children)\n   • Monitor progression every 6-12 months' :
     age < 40 ?
     '• Spectacles or Contact Lenses\n   • LASIK/PRK if stable refraction for 1 year\n   • Patient must be >18 years, refractive stability confirmed' :
     '• Spectacles (single vision or progressive)\n   • Consider multifocal contact lenses\n   • Refractive surgery options limited in presbyopia'
   }

──────────────────────────────────────────────────────

3️⃣  MANAGEMENT PROTOCOL

Spectacle Prescription:
   • Full cycloplegic refraction ${age < 16 ? '(mandatory for children)' : '(if needed)'}
   • Update prescription annually or if symptoms worsen

Contact Lens Protocol (if applicable):
   • Daily disposable preferred for hygiene
   • Regular follow-up every 6 months
   • Strict hygiene counseling

──────────────────────────────────────────────────────

4️⃣  REFRACTIVE SURGERY CANDIDACY (If Applicable)

Eligibility Criteria:
   ✓ Age >18 years (preferably >21)
   ✓ Stable refraction for 12+ months
   ✓ Adequate corneal thickness (>500 microns)
   ✓ No active eye disease
   ✓ Realistic expectations

Pre-op Workup:
   • Corneal topography/tomography
   • Wavefront aberrometry
   • Tear film assessment

──────────────────────────────────────────────────────

5️⃣  FOLLOW-UP RECOMMENDATIONS

   • Annual eye examination
   • Monitor for progression (especially if high myopia)
   • Screen for retinal complications if myopia >-6.00D`;
  };

  const generateVisualDisturbanceProtocol = (age, icdCode) => {
    return `1️⃣  DIFFERENTIAL DIAGNOSIS CONSIDERATIONS

Visual disturbances require systematic evaluation:
   • Refractive error correction status
   • Media opacities (cataract, corneal issues)
   • Retinal pathology (if not already examined)
   • Neurological causes (if bilateral/unexplained)

──────────────────────────────────────────────────────

2️⃣  RECOMMENDED WORKUP

Essential Tests:
   ✓ Best corrected visual acuity
   ✓ Refraction (cycloplegic if indicated)
   ✓ Slit-lamp examination
   ✓ Dilated fundus examination
   ✓ Amsler grid testing

Advanced (if indicated):
   • OCT macula
   • Visual field testing
   • Neuroimaging (if optic nerve involvement suspected)

──────────────────────────────────────────────────────

3️⃣  TREATMENT APPROACH

Based on Underlying Cause:
   • If refractive: Correct with appropriate spectacles
   • If cataract: Consider surgical referral
   • If macular: Medical/laser treatment as indicated
   • If functional: Reassurance + follow-up

──────────────────────────────────────────────────────

4️⃣  FOLLOW-UP PROTOCOL

   • Short-term: 2-4 weeks (if acute/worsening)
   • Routine: 3-6 months if stable
   • Urgent referral if sudden onset/progressive`;
  };

  const generateGenericProtocol = (age, diagnosis) => {
    // Enhanced generic protocol that uses diagnosis text
    const diagnosisLower = diagnosis.toLowerCase();
    let protocol = `1️⃣  CLINICAL EVALUATION

`;
    protocol += `Current Diagnosis: ${diagnosis || 'Under evaluation'}\n`;
    protocol += `Patient Age: ${age} years\n\n`;

    // Analyze diagnosis text for keywords
    const keywords = {
      cataract: diagnosisLower.includes('cataract'),
      glaucoma: diagnosisLower.includes('glaucoma'),
      retina: diagnosisLower.includes('retina') || diagnosisLower.includes('retinal'),
      cornea: diagnosisLower.includes('cornea') || diagnosisLower.includes('corneal'),
      conjunctivitis: diagnosisLower.includes('conjunctivitis') || diagnosisLower.includes('red eye'),
      dryeye: diagnosisLower.includes('dry') || diagnosisLower.includes('tear'),
      refractive: diagnosisLower.includes('myopia') || diagnosisLower.includes('hyperopia') || diagnosisLower.includes('astigmatism')
    };

    protocol += `AI Analysis of Diagnosis Text:\n`;
    if (keywords.cataract) {
      protocol += `   ⚕️  Cataract-related condition detected. Consider phacoemulsification.\n`;
    }
    if (keywords.glaucoma) {
      protocol += `   ⚕️  Glaucoma-related condition. Monitor IOP and consider medical therapy.\n`;
    }
    if (keywords.retina) {
      protocol += `   ⚕️  Retinal condition. May require dilated fundus exam and OCT.\n`;
    }
    if (keywords.cornea) {
      protocol += `   ⚕️  Corneal condition. Consider slit-lamp examination and topical therapy.\n`;
    }
    if (keywords.conjunctivitis) {
      protocol += `   ⚕️  Conjunctivitis suspected. Consider antibiotic/antiviral drops.\n`;
    }
    if (keywords.dryeye) {
      protocol += `   ⚕️  Dry eye symptoms. Consider lubricating drops and punctal plugs.\n`;
    }
    if (keywords.refractive) {
      protocol += `   ⚕️  Refractive error. Consider spectacle/contact lens correction.\n`;
    }

    protocol += `\n──────────────────────────────────────────────────────\n\n`;
    protocol += `2️⃣  GENERAL RECOMMENDATIONS\n\n`;
    protocol += `Based on standard ophthalmic protocols:\n`;
    protocol += `   • Complete comprehensive eye examination\n`;
    protocol += `   • Address chief complaints systematically\n`;
    protocol += `   • Rule out urgent/emergent conditions\n`;
    protocol += `   • Appropriate referral if specialized care needed\n\n`;

    protocol += `──────────────────────────────────────────────────────\n\n`;
    protocol += `3️⃣  TREATMENT APPROACH\n\n`;
    protocol += `Will depend on specific diagnosis confirmed:\n`;
    protocol += `   • Medical management (if applicable)\n`;
    protocol += `   • Surgical intervention (if indicated)\n`;
    protocol += `   • Supportive care and patient education\n\n`;

    protocol += `──────────────────────────────────────────────────────\n\n`;
    protocol += `4️⃣  FOLLOW-UP\n\n`;
    protocol += `   • As per clinical judgment\n`;
    protocol += `   • Typically 2-4 weeks for review\n`;
    protocol += `   • Earlier if symptoms worsen\n\n`;

    protocol += `⚕️  Note: More specific AI recommendations available when ICD codes are selected.\n`;
    protocol += `       Add ICD-10 codes for detailed treatment protocols.`;

    return protocol;
  };

  if (user?.role !== 'DOCTOR') {
    return (
      <Layout>
        <div className="consultation-container">
          <div className="error-message">
            Access Denied. Only doctors can access consultation.
          </div>
        </div>
      </Layout>
    );
  };

  // Get doctor name (capitalize username and add Dr prefix if no name)
  const getDoctorName = () => {
    if (user.name) return user.name;
    const username = user.username || '';
    if (username.startsWith('dr.')) {
      return 'Dr. ' + username.slice(3).split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
    return username.charAt(0).toUpperCase() + username.slice(1);
  };

  return (
    <Layout>
      <div className="consultation-container">
        <h2 className="page-title">Patient Consultation</h2>
        <div className="consultation-layout">
          {/* LEFT PANEL */}
          <div className="consultation-left-panel">
            <h3>Patient Consultation</h3>
            
            <div className="doctor-info">
              <strong>Logged-in Doctor:</strong> {getDoctorName()}
            </div>

          <hr />

          <h4>Patient Details</h4>
          <div className="patient-details-grid">
            <div className="form-field">
              <label>UHID</label>
              <input type="text" value={patientData.uhid} disabled />
            </div>
            <div className="form-field">
              <label>OPD Serial No.</label>
              <input type="text" value={patientData.serial_no} disabled />
            </div>
            <div className="form-field">
              <label>Gender</label>
              <input type="text" value={patientData.gender} disabled />
            </div>
            <div className="form-field">
              <label>Full Name</label>
              <input type="text" value={patientData.name} disabled />
            </div>
            <div className="form-field">
              <label>Age</label>
              <input type="text" value={patientData.age} disabled />
            </div>
            <div className="form-field">
              <label>Phone</label>
              <input type="text" value={patientData.phone} disabled />
            </div>
          </div>

          <hr />

          <h4>Doctor's Clinical Notes</h4>

          <div className="form-field">
            <label>ICD Codes</label>
            <select 
              multiple 
              className="icd-select"
              onChange={handleICDSelect}
              value={selectedICDs.map(icd => icd.id.toString())}
              disabled={!patientData.uhid}
            >
              {icdMaster.map(icd => (
                <option key={icd.id} value={icd.id}>
                  {icd.icd_code} — {icd.description}
                </option>
              ))}
            </select>
            <div className="icd-hint">Hold Ctrl (Cmd on Mac) to select multiple codes</div>
            <div className="selected-icd-tags">
              {selectedICDs.length === 0 ? (
                <em>No ICD codes selected</em>
              ) : (
                selectedICDs.map(icd => (
                  <span key={icd.id} className="icd-tag">
                    {icd.icd_code} — {icd.description}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="form-field">
            <label>Diagnosis</label>
            <textarea 
              rows="3"
              value={clinicalNotes.diagnosis}
              onChange={(e) => setClinicalNotes({ ...clinicalNotes, diagnosis: e.target.value })}
              placeholder="Enter diagnosis..."
              disabled={!patientData.uhid}
            />
          </div>

          <div className="form-field">
            <label>Treatment Plan</label>
            <textarea 
              rows="3"
              value={clinicalNotes.treatment_plan}
              onChange={(e) => setClinicalNotes({ ...clinicalNotes, treatment_plan: e.target.value })}
              placeholder="Enter treatment plan..."
              disabled={!patientData.uhid}
            />
          </div>

          <div className="form-field">
            <label>Follow-up Instructions</label>
            <textarea 
              rows="3"
              value={clinicalNotes.followup_instructions}
              onChange={(e) => setClinicalNotes({ ...clinicalNotes, followup_instructions: e.target.value })}
              placeholder="Enter follow-up instructions..."
              disabled={!patientData.uhid}
            />
          </div>

          <hr />

          <div className="ai-toggle">
            <label>
              <input 
                type="checkbox" 
                checked={showAISummary}
                onChange={(e) => setShowAISummary(e.target.checked)}
              />
              {' '}Show AI Summary & Recommendation
            </label>
          </div>

          {emergencyAlert && showAISummary && (
            <div className="emergency-alert-banner" style={{
              backgroundColor: emergencyAlert.color,
              color: '#fff',
              padding: '15px',
              marginTop: '15px',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '16px',
              border: '3px solid #000',
              animation: 'pulse 1.5s infinite',
              textAlign: 'center',
              boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                {emergencyAlert.level === 'EMERGENCY' ? '🚨🚨🚨 EMERGENCY 🚨🚨🚨' : '⚠️⚠️ URGENT ⚠️⚠️'}
              </div>
              <div style={{ fontSize: '18px', marginBottom: '10px' }}>{emergencyAlert.message}</div>
              <div style={{ fontSize: '14px', marginTop: '8px', backgroundColor: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '4px' }}>
                <strong>ACTION REQUIRED:</strong> {emergencyAlert.action.replace(/_/g, ' ')}
              </div>
              <div style={{ fontSize: '14px', marginTop: '5px' }}>
                <strong>TIMEFRAME:</strong> {emergencyAlert.timeframe}
              </div>
            </div>
          )}

          {showAISummary && (
            <div className="ai-summary-box">
              <h5>AI-Generated Treatment Protocol</h5>
              <textarea 
                rows="25" 
                disabled 
                value={generateAISummary()}
                style={{ 
                  background: '#f8f9fa', 
                  color: '#2c3e50',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap'
                }}
              />
              <div className="ai-feedback">
                {aiFeedbackSubmitted ? (
                  <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                    ✓ Thank you for your feedback!
                  </span>
                ) : (
                  <>
                    <small style={{ color: '#6b6f73', marginRight: '10px' }}>Was this protocol helpful?</small>
                    <button 
                      className="btn-small" 
                      onClick={() => submitAIFeedback('helpful')}
                      disabled={!patientData.uhid}
                    >
                      👍 Yes
                    </button>
                    {' '}
                    <button 
                      className="btn-small" 
                      onClick={() => submitAIFeedback('not_helpful')}
                      disabled={!patientData.uhid}
                    >
                      👎 No
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button 
              className="btn-primary" 
              onClick={handleUpdate}
              disabled={loading || !patientData.uhid}
            >
              {loading ? 'Saving...' : 'Update'}
            </button>
            <button className="btn-secondary" onClick={clearForm}>
              Clear
            </button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="consultation-right-panel">
          <h4>Today's OPD Queue</h4>
          <div className="queue-list">
            {queue.length === 0 ? (
              <p className="no-data">No patients in queue</p>
            ) : (
              queue.map(entry => (
                <div key={entry.id} className="queue-item">
                  <div className="queue-info">
                    <div className="queue-header">
                      <strong>{String(entry.serial_no).padStart(2, '0')}</strong> — {entry.first_name} {entry.last_name}
                    </div>
                    <div className="queue-meta">
                      {entry.uhid} • {entry.phone}
                    </div>
                  </div>
                  <div className="queue-actions">
                    <span className={`status-badge ${getStatusClass(entry.status)}`}>
                      {entry.status.replace('_', ' ')}
                    </span>
                    <button 
                      className="btn-small"
                      onClick={() => loadPatientFromQueue(entry)}
                      disabled={entry.status === 'COMPLETED'}
                    >
                      Load
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {patientData.uhid && (
            <>
              <hr />
              <h4>Patient History</h4>
              <div className="history-list">
                {patientHistory.length === 0 ? (
                  <p className="no-data">No previous consultations</p>
                ) : (
                  patientHistory.map(history => (
                    <div key={history.id} className="history-item">
                      <div className="history-date">{formatDate(history.created_at)}</div>
                      <div className="history-doctor">{history.doctor_name}</div>
                      <div className="history-diagnosis">
                        {history.diagnosis || 'No diagnosis recorded'}
                      </div>
                      <span className={`status-badge ${getStatusClass('COMPLETED')}`}>
                        COMPLETED
                      </span>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
      </div>
    </Layout>
  );
}

export default Consultation;

