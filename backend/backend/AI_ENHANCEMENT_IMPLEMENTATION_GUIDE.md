# AI Clinical Decision Support Enhancement Implementation Guide

## Overview
Implementing severity tagging, red-flag detection, structured JSON output, and emergency protocols for the Consultation module.

## Phase 1: Add Severity System (Add after imports, before function Consultation())

```javascript
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
```

## Phase 2: Add State Variables for New Features

Find this section (around line 33-42):
```javascript
const [clinicalNotes, setClinicalNotes] = useState({
  diagnosis: '',
  treatment_plan: '',
  followup_instructions: ''
});
```

Add after it:
```javascript
const [aiStructuredData, setAiStructuredData] = useState(null);
const [emergencyAlert, setEmergencyAlert] = useState(null);
```

## Phase 3: Add Severity Helper Function

Add this function after the fetchPatientHistory function:

```javascript
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
```

## Phase 4: Enhance generateAISummary Function

Locate the `generateAISummary` function and add structured data generation at the beginning:

```javascript
const generateAISummary = () => {
  // ... existing checks ...
  
  // Get severity information
  const severityInfo = getSeverityInfo(primaryICD?.icd_code);
  
  // Generate structured JSON data internally
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
    red_flags: [],
    follow_up_days: severityInfo.priority === 1 ? 1 : severityInfo.priority === 2 ? 3 : severityInfo.priority === 3 ? 14 : 30,
    ai_version: 'v2.0',
    generated_at: new Date().toISOString()
  };
  
  // Check for emergency conditions and set alert
  if (severityInfo.level === 'EMERGENCY') {
    const alert = {
      level: 'EMERGENCY',
      message: `🚨 URGENT: ${primaryICD?.description || currentDiagnosis}`,
      action: severityInfo.action,
      timeframe: severityInfo.timeframe,
      color: severityInfo.color
    };
    setEmergencyAlert(alert);
    structuredData.red_flags.push(alert.message);
  } else if (severityInfo.level === 'URGENT') {
    const alert = {
      level: 'URGENT',
      message: `⚠️ URGENT: ${primaryICD?.description || currentDiagnosis}`,
      action: severityInfo.action,
      timeframe: severityInfo.timeframe,
      color: severityInfo.color
    };
    setEmergencyAlert(alert);
    structuredData.red_flags.push(alert.message);
  } else {
    setEmergencyAlert(null);
  }
  
  // Store structured data
  setAiStructuredData(structuredData);
  
  // Continue with protocol generation...
};
```

## Phase 5: Update Protocol Header

In the protocol generation section, add severity info after patient details:

```javascript
if (primaryICD) {
  protocol += `Primary ICD: ${primaryICD.icd_code} — ${primaryICD.description}\n`;
  protocol += `\n🏷️  SEVERITY: ${severityInfo.level}\n`;
  protocol += `⏰  TIMEFRAME: ${severityInfo.timeframe}\n`;
  protocol += `📋  RECOMMENDED ACTION: ${severityInfo.action.replace(/_/g, ' ')}\n`;
}
```

## Phase 6: Add Emergency Protocol Functions

Add these new protocol generator functions after the existing ones (generateCataractProtocol, etc.):

1. `generateRetinalDetachmentProtocol(age, icdCode, description)` - For H33
2. `generateRetinalVascularProtocol(age, icdCode, description)` - For H34
3. `generateEndophthalmitisProtocol(age, icdCode, description)` - For H44.0
4. `generateAcuteGlaucomaProtocol(age, icdCode, description)` - For H40.2
5. `generateCornealUlcerProtocol(age, icdCode, description)` - For H16

## Phase 7: Update Protocol Routing

In generateAISummary, before the existing if-else chain for protocol generation:

```javascript
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
  // ... existing code
}
```

## Phase 8: Add Emergency Alert Banner UI

In the JSX render section, add this before the AI summary box:

```jsx
{emergencyAlert && (
  <div className="emergency-alert-banner" style={{
    backgroundColor: emergencyAlert.color,
    color: '#fff',
    padding: '15px',
    marginTop: '15px',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '16px',
    border: '3px solid #000',
    animation: 'pulse 1.5s infinite'
  }}>
    <div style={{ fontSize: '24px', marginBottom: '8px' }}>
      {emergencyAlert.level === 'EMERGENCY' ? '🚨🚨🚨' : '⚠️⚠️'}
    </div>
    <div>{emergencyAlert.message}</div>
    <div style={{ fontSize: '14px', marginTop: '8px' }}>
      ACTION REQUIRED: {emergencyAlert.action.replace(/_/g, ' ')}
    </div>
    <div style={{ fontSize: '14px' }}>
      TIMEFRAME: {emergencyAlert.timeframe}
    </div>
  </div>
)}
```

## Phase 9: Add CSS Animation

Add to consultation.css:

```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.02);
  }
}

.emergency-alert-banner {
  animation: pulse 1.5s infinite;
}
```

## Phase 10: Update Seed Data with Emergency ICD Codes

Update backend/src/db/seed.js to include:

```javascript
const icdCodes = [
  // ... existing codes ...
  { code: 'H33.0', desc: 'Retinal Detachment' },
  { code: 'H34.1', desc: 'Central Retinal Artery Occlusion' },
  { code: 'H34.8', desc: 'Central Retinal Vein Occlusion' },
  { code: 'H44.0', desc: 'Endophthalmitis' },
  { code: 'H40.2', desc: 'Acute Angle Closure Glaucoma' },
  { code: 'H16.0', desc: 'Corneal Ulcer' },
  { code: 'H16.2', desc: 'Keratoconjunctivitis' },
  { code: 'H43.1', desc: 'Vitreous Hemorrhage' },
  { code: 'H27.0', desc: 'Aphakia' },
  { code: 'S05.1', desc: 'Ocular Contusion and Tissue Trauma' }
];
```

## Implementation Steps

1. **Backup current file**: `cp Consultation.jsx Consultation.jsx.bak`
2. **Add Phase 1**: Severity mapping constant
3. **Add Phase 2**: New state variables
4. **Add Phase 3**: Helper function
5. **Modify Phase 4**: Enhance generateAISummary
6. **Modify Phase 5**: Update protocol header
7. **Add Phase 6**: New emergency protocol functions (see separate file for full implementations)
8. **Modify Phase 7**: Update routing logic
9. **Modify Phase 8**: Add UI components
10. **Add Phase 9**: CSS animations
11. **Update Phase 10**: Seed script with new ICD codes
12. **Test**: Restart backend, reseed database, test with emergency conditions

## Testing Scenarios

1. **H33** (Retinal Detachment): Should show RED emergency banner
2. **H16** (Corneal Ulcer): Should show ORANGE urgent banner
3. **H35.3** (Diabetic Retinopathy): Should show YELLOW high priority
4. **H25** (Cataract): Should show GREEN routine

## Benefits

- ✅ Clear visual severity indicators
- ✅ Emergency conditions can't be missed
- ✅ Structured data ready for ML training
- ✅ Comprehensive emergency protocols
- ✅ Scalable system (easy to add new conditions)

---

**Note**: Due to file size and complexity, recommend implementing in stages and testing after each phase.
