import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import PatientSearch from '../../components/common/PatientSearch';
import axios from '../../api/axios';
import '../../styles/billing.css';

export default function Billing() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    todayDate: new Date().toISOString().split('T')[0],
    billDate: new Date().toISOString().split('T')[0],
    uhid: '',
    billNo: 'Auto-generated',
    billId: null, // Track bill ID for updates
  });

  const [patientData, setPatientData] = useState({
    uhid: '',
    name: '',
    gender: '',
    age: '',
    phone: '',
    doctor: '',
    address: '',
    time: '',
    relation: '',
  });

  const [categories, setCategories] = useState([]);
  const [charges, setCharges] = useState([]);
  const [filteredCharges, setFilteredCharges] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCharge, setSelectedCharge] = useState('');
  const [qty, setQty] = useState(1);
  const [rate, setRate] = useState(0);
  const [billItems, setBillItems] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [billType, setBillType] = useState('Cash');
  const [admitDate, setAdmitDate] = useState('');
  const [dischargeDate, setDischargeDate] = useState('');
  
  // Conditional fields
  const [upiReference, setUpiReference] = useState('');
  const [aadhaarNo, setAadhaarNo] = useState('');
  const [ayushmanCard, setAyushmanCard] = useState('');
  const [rationCard, setRationCard] = useState('');
  const [echsReferralNo, setEchsReferralNo] = useState('');
  const [echsServiceNo, setEchsServiceNo] = useState('');
  const [echsClaimId, setEchsClaimId] = useState('');

  const [todayBills, setTodayBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [patientLoaded, setPatientLoaded] = useState(false);

  // Load categories and today's bills
  useEffect(() => {
    fetchCategories();
    fetchServiceCharges();
    fetchTodayBills();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/billing/masters/categories');
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchServiceCharges = async () => {
    try {
      const response = await axios.get('/billing/masters/service-charges');
      // Backend returns 'charges', not 'service_charges'
      setCharges(response.data.charges || []);
    } catch (error) {
      console.error('Failed to fetch charges:', error);
    }
  };

  const fetchTodayBills = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await axios.get(`/billing?from_date=${today}&to_date=${today}&limit=20`);
      setTodayBills(response.data.bills || []);
    } catch (error) {
      console.error('Failed to fetch today\'s bills:', error);
    }
  };

  const loadPatient = async (patient) => {
    
    // patient is already the full patient object from PatientSearch component
    try {
      // Clear all previous data to prevent mixing states
      clearForm();
      
      // Fetch last OPD visit to get doctor
      let doctorName = '';
      try {
        const opdResponse = await axios.get(`/opd/patient/${patient.uhid}`);
        if (opdResponse.data.data && opdResponse.data.data.length > 0) {
          // Get the most recent OPD visit
          doctorName = opdResponse.data.data[0].doctor_name || '';
        }
      } catch (error) {
      }

      // Concatenate address fields
      const addressParts = [
        patient.address,
        patient.village,
        patient.district
      ].filter(Boolean).join(', ');

      setPatientData({
        uhid: patient.uhid,
        name: `${patient.first_name} ${patient.middle_name || ''} ${patient.last_name}`.trim(),
        gender: patient.gender || '',
        age: patient.age || '',
        phone: patient.phone || '',
        doctor: doctorName,
        address: addressParts,
        time: new Date().toTimeString().slice(0, 5),
        relation: patient.guardian_name || '',
      });

      // Check if bill exists for this patient on today's date
      const today = new Date().toISOString().split('T')[0];
      try {
        const billResponse = await axios.get(`/billing?search=${patient.uhid}&from_date=${today}&to_date=${today}`);
        const existingBills = billResponse.data.bills || [];
        
        if (existingBills.length > 0) {
          // Load existing bill
          const bill = existingBills[0];
          
          // Fetch full bill details with items
          const billDetailResponse = await axios.get(`/billing/${bill.id}`);
          const billDetail = billDetailResponse.data.bill;

          // Load bill items
          const items = billDetail.bill_items || [];
          const loadedItems = items.map(item => ({
            id: item.id,
            charge_id: item.charge_id,
            charge_name: item.charge_name,
            category_id: item.category,
            qty: item.qty,
            rate: parseFloat(item.rate),
            amount: parseFloat(item.amount),
          }));
          
          setBillItems(loadedItems);

          // Load bill details
          setDiscount(parseFloat(billDetail.discount_amount) || 0);
          setBillType(billDetail.bill_type || 'Cash');
          setUpiReference(billDetail.upi_reference || '');
          setAadhaarNo(billDetail.aadhaar_no || '');
          setAyushmanCard(billDetail.ayushman_card_no || '');
          setRationCard(billDetail.ration_card_no || '');
          setEchsReferralNo(billDetail.echs_referral_no || '');
          setEchsServiceNo(billDetail.echs_service_no || '');
          setEchsClaimId(billDetail.echs_claim_id || '');
          setAdmitDate(billDetail.admit_date || '');
          setDischargeDate(billDetail.discharge_date || '');
          
          setPatientLoaded(true);
          
          const newFormData = {
            todayDate: today,
            uhid: patient.uhid,
            billNo: billDetail.bill_no,
            billDate: billDetail.bill_date,
            billId: billDetail.id
          };
          setFormData(newFormData);
          
          // Format date for alert
          const [year, month, day] = billDetail.bill_date.split('-');
          const billDateFormatted = `${day}/${month}/${year}`;
          alert(`Loaded existing bill #${billDetail.bill_no} dated ${billDateFormatted}`);
        } else {
          // No existing bill for today
          setPatientLoaded(true);
          const newFormData = {
            todayDate: today,
            uhid: patient.uhid,
            billNo: 'Auto-generated',
            billDate: today,
            billId: null
          };
          setFormData(newFormData);
        }
      } catch (error) {
        // No existing bill, just set patient data
        setPatientLoaded(true);
        const newFormData = {
          todayDate: today,
          uhid: patient.uhid,
          billNo: 'Auto-generated',
          billDate: today,
          billId: null
        };
        setFormData(newFormData);
      }
    } catch (error) {
      console.error('Error loading patient:', error);
    }
  };

  const searchByUHID = async (uhid, searchBillDate = null) => {
    
    if (!uhid || !uhid.trim()) {
      alert('Please enter UHID');
      return;
    }

    // Use provided bill date or the one from form
    const billDateToSearch = searchBillDate || formData.billDate;

    try {
      setLoading(true);
      // Clear all previous data to prevent mixing states
      clearForm();
      
      // Search for patient by UHID
      const patientResponse = await axios.get(`/patients?search=${uhid}`);
      const patients = patientResponse.data.data || [];
      
      if (patients.length === 0) {
        alert('Patient not found with UHID: ' + uhid);
        setLoading(false);
        return;
      }

      const patient = patients[0];

      // Check if bill exists for this patient on selected bill date
      try {
        const billResponse = await axios.get(`/billing?search=${uhid}&from_date=${billDateToSearch}&to_date=${billDateToSearch}`);
        const existingBills = billResponse.data.bills || [];
        
        if (existingBills.length > 0) {
          // Load existing bill
          const bill = existingBills[0];
          
          // Fetch bill details with items in one call
          const billDetailResponse = await axios.get(`/billing/${bill.id}`);
          const billDetail = billDetailResponse.data.bill;
          
          // Fetch last OPD visit to get doctor
          let doctorName = '';
          try {
            const opdResponse = await axios.get(`/opd/patient/${patient.uhid}`);
            if (opdResponse.data.data && opdResponse.data.data.length > 0) {
              // Get the most recent OPD visit
              doctorName = opdResponse.data.data[0].doctor_name || '';
            }
          } catch (error) {
          }

          // Concatenate address fields
          const addressParts = [
            patient.address,
            patient.village,
            patient.district
          ].filter(Boolean).join(', ');

          // Load patient details
          setPatientData({
            uhid: patient.uhid,
            name: `${patient.first_name} ${patient.middle_name || ''} ${patient.last_name}`.trim(),
            gender: patient.gender || '',
            age: patient.age || '',
            phone: patient.phone || '',
            doctor: doctorName,
            address: addressParts,
            time: new Date(billDetail.created_at).toTimeString().slice(0, 5),
            relation: patient.guardian_name || '',
          });

          // Load bill items from bill detail
          const items = billDetail.bill_items || [];
          const loadedItems = items.map(item => ({
            id: item.id,
            charge_id: item.charge_id,
            charge_name: item.charge_name,
            category_id: item.category,
            qty: item.qty,
            rate: parseFloat(item.rate),
            amount: parseFloat(item.amount),
          }));
          
          setBillItems(loadedItems);

          // Load bill details
          setDiscount(parseFloat(billDetail.discount_amount) || 0);
          setBillType(billDetail.bill_type || 'Cash');
          setUpiReference(billDetail.upi_reference || '');
          setAadhaarNo(billDetail.aadhaar_no || '');
          setAyushmanCard(billDetail.ayushman_card_no || '');
          setRationCard(billDetail.ration_card_no || '');
          setEchsReferralNo(billDetail.echs_referral_no || '');
          setEchsServiceNo(billDetail.echs_service_no || '');
          setEchsClaimId(billDetail.echs_claim_id || '');
          setAdmitDate(billDetail.admit_date || '');
          setDischargeDate(billDetail.discharge_date || '');
          
          setPatientLoaded(true);
          
          // bill_date is now returned as 'YYYY-MM-DD' text from backend (no timezone issues)
          const billDateForInput = billDetail.bill_date;
          const newFormData = { 
            todayDate: new Date().toISOString().split('T')[0],
            uhid: patient.uhid, 
            billNo: billDetail.bill_no, 
            billDate: billDateForInput,
            billId: billDetail.id // Store bill ID for updates
          };
          setFormData(newFormData);
          
          // Format date for alert (dd/mm/yyyy)
          const [year, month, day] = billDateForInput.split('-');
          const billDateFormatted = `${day}/${month}/${year}`;
          alert(`Loaded existing bill #${billDetail.bill_no} dated ${billDateFormatted}`);
        } else {
          // No existing bill for this date
          const today = new Date().toISOString().split('T')[0];
          const isOldDate = billDateToSearch < today;
          
          if (isOldDate) {
            // Load patient but don't allow new bill creation for past dates
            await loadPatient(patient);
            // Ensure billDate is in yyyy-MM-dd format
            const dateForInput = new Date(billDateToSearch).toISOString().split('T')[0];
            const newFormData = { 
              todayDate: new Date().toISOString().split('T')[0],
              uhid: patient.uhid, 
              billNo: 'Auto-generated',
              billDate: dateForInput,
              billId: null
            };
            setFormData(newFormData);
            alert(`No bill found for ${new Date(billDateToSearch).toLocaleDateString('en-GB')}. New bills can only be created for today's date.`);
          } else {
            // Load patient for new bill creation
            await loadPatient(patient);
            // Ensure billDate is in yyyy-MM-dd format
            const dateForInput = new Date(billDateToSearch).toISOString().split('T')[0];
            const newFormData = { 
              todayDate: new Date().toISOString().split('T')[0],
              uhid: patient.uhid, 
              billNo: 'Auto-generated',
              billDate: dateForInput,
              billId: null
            };
            setFormData(newFormData);
          }
        }
      } catch (error) {
        // Error checking for bills, just load patient
        await loadPatient(patient);
      }
    } catch (error) {
      console.error('Failed to search patient:', error);
      alert('Failed to search patient. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadBillById = async (billId) => {
    
    try {
      setLoading(true);
      // Clear all previous data to prevent mixing states
      clearForm();

      // Fetch bill details with items
      const billDetailResponse = await axios.get(`/billing/${billId}`);
      const billDetail = billDetailResponse.data.bill;

      // Fetch patient details
      const patientResponse = await axios.get(`/patients?search=${billDetail.uhid}`);
      const patients = patientResponse.data.data || [];
      
      if (patients.length === 0) {
        alert('Patient not found');
        setLoading(false);
        return;
      }

      const patient = patients[0];

      // Fetch last OPD visit to get doctor
      let doctorName = '';
      try {
        const opdResponse = await axios.get(`/opd/patient/${patient.uhid}`);
        if (opdResponse.data.data && opdResponse.data.data.length > 0) {
          doctorName = opdResponse.data.data[0].doctor_name || '';
        }
      } catch (error) {
      }

      // Concatenate address fields
      const addressParts = [
        patient.address,
        patient.village,
        patient.district
      ].filter(Boolean).join(', ');

      // Load patient details
      setPatientData({
        uhid: patient.uhid,
        name: `${patient.first_name} ${patient.middle_name || ''} ${patient.last_name}`.trim(),
        gender: patient.gender || '',
        age: patient.age || '',
        phone: patient.phone || '',
        doctor: doctorName,
        address: addressParts,
        time: new Date(billDetail.created_at).toTimeString().slice(0, 5),
        relation: patient.guardian_name || '',
      });

      // Load bill items from bill detail
      const items = billDetail.bill_items || [];
      const loadedItems = items.map(item => ({
        id: item.id,
        charge_id: item.charge_id,
        charge_name: item.charge_name,
        category_id: item.category,  // category from DB is the category name string
        qty: item.qty,
        rate: parseFloat(item.rate),
        amount: parseFloat(item.amount),
      }));
      
      setBillItems(loadedItems);

      // Load bill details
      setDiscount(parseFloat(billDetail.discount_amount) || 0);
      setBillType(billDetail.bill_type || 'Cash');
      setUpiReference(billDetail.upi_reference || '');
      setAadhaarNo(billDetail.aadhaar_no || '');
      setAyushmanCard(billDetail.ayushman_card_no || '');
      setRationCard(billDetail.ration_card_no || '');
      setEchsReferralNo(billDetail.echs_referral_no || '');
      setEchsServiceNo(billDetail.echs_service_no || '');
      setEchsClaimId(billDetail.echs_claim_id || '');
      setAdmitDate(billDetail.admit_date || '');
      setDischargeDate(billDetail.discharge_date || '');
      
      setPatientLoaded(true);
      
      // bill_date is now returned as 'YYYY-MM-DD' text from backend (no timezone issues)
      const billDateForInput = billDetail.bill_date;
      const newFormData = { 
        todayDate: new Date().toISOString().split('T')[0],
        uhid: patient.uhid, 
        billNo: billDetail.bill_no, 
        billDate: billDateForInput,
        billId: billDetail.id // Store bill ID for updates
      };
      setFormData(newFormData);
      
      // Format date for alert (dd/mm/yyyy)
      const [year, month, day] = billDateForInput.split('-');
      const billDateFormatted = `${day}/${month}/${year}`;
      alert(`Loaded bill #${billDetail.bill_no} dated ${billDateFormatted}`);
    } catch (error) {
      console.error('Failed to load bill:', error);
      alert('Failed to load bill. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    const filtered = charges.filter(c => c.category_id === parseInt(categoryId));
    setFilteredCharges(filtered);
    setSelectedCharge('');
    setRate(0);
  };

  const handleChargeSelect = (chargeId) => {
    setSelectedCharge(chargeId);
    const charge = charges.find(c => c.id === parseInt(chargeId));
    if (charge) {
      setRate(charge.default_rate);
    }
  };

  const addCharge = () => {
    if (!selectedCharge) {
      alert('Please select a charge');
      return;
    }

    const charge = charges.find(c => c.id === parseInt(selectedCharge));
    const amount = qty * rate;

    const newItem = {
      id: Date.now(),
      charge_id: charge.id,
      charge_name: charge.charge_name,
      category_id: selectedCategory,
      qty,
      rate,
      amount,
    };

    setBillItems([...billItems, newItem]);
    
    // Reset selection
    setSelectedCharge('');
    setQty(1);
    setRate(0);
  };

  const removeCharge = (id) => {
    const newItems = billItems.filter(item => item.id !== id);
    setBillItems(newItems);
  };

  const calculateTotal = () => {
    const gross = billItems.reduce((sum, item) => sum + item.amount, 0);
    return gross - discount;
  };

  const createNewBill = async () => {
    try {
      setLoading(true);

      // Determine main category from bill items (use first item's category or default)
      const mainCategory = billItems.length > 0 
        ? categories.find(c => c.id === parseInt(billItems[0].category_id))?.category_name || 'General'
        : 'General';

      const billData = {
        uhid: patientData.uhid,
        patient_name: patientData.name,
        phone: patientData.phone,
        relation_text: patientData.relation,
        category: mainCategory,
        bill_type: billType,
        discount_amount: parseFloat(discount) || 0,
        upi_reference: billType === 'UPI' ? upiReference : null,
        aadhaar_no: billType === 'Ayushman' ? aadhaarNo : null,
        ayushman_card_no: billType === 'Ayushman' ? ayushmanCard : null,
        ration_card_no: billType === 'Ayushman' ? rationCard : null,
        echs_referral_no: billType === 'ECHS' ? echsReferralNo : null,
        echs_service_no: billType === 'ECHS' ? echsServiceNo : null,
        echs_claim_id: billType === 'ECHS' ? echsClaimId : null,
        admit_date: admitDate || null,
        discharge_date: dischargeDate || null,
        items: billItems.map(item => ({
          charge_id: item.charge_id,
          charge_name: item.charge_name,
          category: categories.find(c => c.id === parseInt(item.category_id))?.category_name || 'General',
          qty: parseInt(item.qty) || 1,
          rate: parseFloat(item.rate) || 0,
          amount: parseFloat(item.amount) || 0,
        })),
      };


      const response = await axios.post('/billing', billData);
      
      alert(`Bill created successfully! Bill No: ${response.data.bill.bill_no}`);
      
      // Refresh today's bills
      setTimeout(() => {
        fetchTodayBills();
      }, 500);
      
      // Clear form
      clearForm();
    } catch (error) {
      console.error('Failed to create bill:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.errors?.join(', ') || error.response?.data?.message || error.message;
      alert('Failed to create bill: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const updateExistingBill = async () => {
    try {
      setLoading(true);

      // Determine main category from bill items
      const mainCategory = billItems.length > 0 
        ? categories.find(c => c.id === parseInt(billItems[0].category_id))?.category_name || 'General'
        : 'General';

      const updateData = {
        uhid: patientData.uhid,
        patient_name: patientData.name,
        phone: patientData.phone,
        relation_text: patientData.relation,
        category: mainCategory,
        bill_type: billType,
        discount_amount: parseFloat(discount) || 0,
        upi_reference: billType === 'UPI' ? upiReference : null,
        aadhaar_no: billType === 'Ayushman' ? aadhaarNo : null,
        ayushman_card_no: billType === 'Ayushman' ? ayushmanCard : null,
        ration_card_no: billType === 'Ayushman' ? rationCard : null,
        echs_referral_no: billType === 'ECHS' ? echsReferralNo : null,
        echs_service_no: billType === 'ECHS' ? echsServiceNo : null,
        echs_claim_id: billType === 'ECHS' ? echsClaimId : null,
        admit_date: admitDate || null,
        discharge_date: dischargeDate || null,
        items: billItems.map(item => {
          return {
            charge_id: item.charge_id,
            charge_name: item.charge_name,
            category: categories.find(c => c.id === parseInt(item.category_id))?.category_name || 'General',
            qty: parseInt(item.qty) || 1,
            rate: parseFloat(item.rate) || 0,
            amount: parseFloat(item.amount) || 0,
          };
        }),
      };


      const response = await axios.put(`/billing/${formData.billId}`, updateData);
      
      alert(`Bill #${response.data.bill.bill_no} updated successfully! New amount: ₹${response.data.bill.net_amount}`);
      
      // Refresh today's bills
      setTimeout(() => {
        fetchTodayBills();
      }, 500);
      
      // Clear form
      clearForm();
    } catch (error) {
      console.error('Failed to update bill:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.errors?.join(', ') || error.response?.data?.message || error.message;
      alert('Failed to update bill: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const saveBill = async () => {
    if (!patientLoaded) {
      alert('Please load a patient first');
      return;
    }

    if (billItems.length === 0) {
      alert('Please add at least one charge');
      return;
    }

    // Check if editing existing bill or creating new one
    const isEditingExistingBill = formData.billId !== null && formData.billNo !== 'Auto-generated';

    if (isEditingExistingBill) {
      // Update existing bill
      await updateExistingBill();
    } else {
      // Validate date for new bills only
      const today = new Date().toISOString().split('T')[0];
      if (formData.billDate !== today) {
        alert('New bills can only be created for today\'s date. Please set Bill Date to today.');
        return;
      }
      // Create new bill
      await createNewBill();
    }
  };

  const loadBillForEditing = async (bill) => {
    try {
      // Fetch full bill details with items
      const response = await axios.get(`/billing/${bill.id}`);
      const fullBill = response.data.bill;
      
      alert(`Loading bill for editing: Bill No ${fullBill.bill_no}`);
      
      // Load bill data
      setFormData({
        ...formData,
        billNo: fullBill.bill_no,
        billDate: fullBill.bill_date,
      });
      
      setBillType(fullBill.bill_type);
      setDiscount(fullBill.discount_amount);
      
      // Load conditional fields
      setUpiReference(fullBill.upi_reference || '');
      setAadhaarNo(fullBill.aadhaar_no || '');
      setAyushmanCard(fullBill.ayushman_card_no || '');
      setRationCard(fullBill.ration_card_no || '');
      setEchsReferralNo(fullBill.echs_referral_no || '');
      setEchsServiceNo(fullBill.echs_service_no || '');
      setEchsClaimId(fullBill.echs_claim_id || '');
      
      // Load bill items
      if (fullBill.items && fullBill.items.length > 0) {
        const items = fullBill.items.map((item, index) => ({
          id: Date.now() + index,
          charge_id: item.charge_id,
          charge_name: item.charge_name,
          category_id: item.category,
          qty: item.qty,
          rate: item.rate,
          amount: item.amount,
        }));
        setBillItems(items);
      }
    } catch (error) {
      console.error('Failed to load bill details:', error);
      alert('Error loading bill details for editing');
    }
  };

  const cancelBill = async () => {
    if (!formData.billId) {
      alert('No bill loaded to cancel');
      return;
    }

    const billNo = formData.billNo;
    const reason = window.prompt(
      `Are you sure you want to cancel Bill #${billNo}?\n\nPlease provide a reason for cancellation:`
    );

    if (!reason || reason.trim() === '') {
      alert('Cancellation requires a reason');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`/billing/${formData.billId}/cancel`, {
        cancel_reason: reason.trim()
      });
      
      alert(`Bill #${billNo} has been cancelled successfully`);
      
      // Refresh today's bills
      fetchTodayBills();
      
      // Clear form
      clearForm();
    } catch (error) {
      console.error('Failed to cancel bill:', error);
      const errorMsg = error.response?.data?.message || error.message;
      alert('Failed to cancel bill: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setPatientData({
      uhid: '',
      name: '',
      gender: '',
      age: '',
      phone: '',
      doctor: '',
      address: '',
      time: '',
      relation: '',
    });
    setBillItems([]);
    setSelectedCategory('');
    setSelectedCharge('');
    setQty(1);
    setRate(0);
    setDiscount(0);
    setBillType('Cash');
    setAdmitDate('');
    setDischargeDate('');
    setUpiReference('');
    setAadhaarNo('');
    setAyushmanCard('');
    setRationCard('');
    setEchsReferralNo('');
    setEchsServiceNo('');
    setEchsClaimId('');
    setPatientLoaded(false);
    const clearedFormData = {
      todayDate: new Date().toISOString().split('T')[0],
      billDate: new Date().toISOString().split('T')[0],
      uhid: '',
      billNo: 'Auto-generated',
      billId: null,
    };
    setFormData(clearedFormData);
  };

  const printReceipt = () => {
    if (!patientLoaded || billItems.length === 0) {
      alert('Please add bill items before printing');
      return;
    }

    // Create printable receipt content
    const receiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bill Receipt - ${formData.uhid}</title>
        <style>
          @media print {
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            .no-print { display: none; }
          }
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #0f6b63; padding-bottom: 10px; margin-bottom: 20px; }
          .header h1 { color: #0f6b63; margin: 0; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .info-label { font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #0f6b63; color: white; }
          .total-row { font-weight: bold; background-color: #f4f7f6; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
          @page { margin: 1cm; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Seemant Eye Hospital</h1>
          <p>Bill Receipt</p>
        </div>
        <div class="info-row"><span class="info-label">Bill Date:</span> <span>${formData.billDate}</span></div>
        <div class="info-row"><span class="info-label">UHID:</span> <span>${patientData.uhid}</span></div>
        <div class="info-row"><span class="info-label">Patient Name:</span> <span>${patientData.name}</span></div>
        <div class="info-row"><span class="info-label">Age / Gender:</span> <span>${patientData.age} / ${patientData.gender}</span></div>
        <div class="info-row"><span class="info-label">Phone:</span> <span>${patientData.phone}</span></div>
        <div class="info-row"><span class="info-label">Doctor:</span> <span>${patientData.doctor}</span></div>
        <div class="info-row"><span class="info-label">Relation:</span> <span>${patientData.relation}</span></div>
        <div class="info-row"><span class="info-label">Bill Type:</span> <span>${billType}</span></div>
        
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Service / Charge</th>
              <th>Qty</th>
              <th>Rate (₹)</th>
              <th>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${billItems.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.charge_name}</td>
                <td>${item.qty}</td>
                <td>${item.rate.toFixed(2)}</td>
                <td>${item.amount.toFixed(2)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="4" style="text-align: right;">Gross Amount:</td>
              <td>₹${billItems.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="4" style="text-align: right;">Discount:</td>
              <td>₹${discount.toFixed(2)}</td>
            </tr>
            <tr class="total-row" style="font-size: 16px;">
              <td colspan="4" style="text-align: right;">Net Amount:</td>
              <td>₹${calculateTotal()}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="footer">
          <p>Thank you for choosing Seemant Eye Hospital</p>
          <p>This is a computer-generated receipt</p>
        </div>
        
        <div class="no-print" style="text-align: center; margin-top: 20px;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #0f6b63; color: white; border: none; border-radius: 4px; cursor: pointer;">Print</button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">Close</button>
        </div>
      </body>
      </html>
    `;

    // Open print window
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(receiptContent);
    printWindow.document.close();
  };

  return (
    <Layout>
      <div className="billing-container">
        <h2 className="page-title">Patient Billing</h2>
        
        <div className="billing-layout">
          {/* LEFT PANEL */}
          <div className="billing-left-panel">
            {/* Top Row */}
            <div className="billing-row">
              <div className="form-field" style={{ width: '150px' }}>
                <label>Date</label>
                <input type="date" value={formData.todayDate} disabled />
              </div>
              <div className="form-field" style={{ width: '150px' }}>
                <label>Bill Date</label>
                <input type="date" value={formData.billDate} onChange={(e) => setFormData({ ...formData, billDate: e.target.value })} />
              </div>
              <div className="form-field" style={{ flex: 1 }}>
                <label>UHID (Search)</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input 
                    placeholder="Enter UHID" 
                    value={formData.uhid}
                    onChange={(e) => setFormData({ ...formData, uhid: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && searchByUHID(formData.uhid)}
                  />
                  <button className="btn-secondary" onClick={() => searchByUHID(formData.uhid)} disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>
              <div className="form-field" style={{ width: '120px' }}>
                <label>Bill No.</label>
                <input value={formData.billNo} disabled />
              </div>
            </div>

            <hr />

            {/* Patient Details */}
            <h4>Patient Details</h4>
            <div className="patient-details-box">
              <div className="billing-grid-3">
                <div className="form-field">
                  <label>UHID</label>
                  <input value={patientData.uhid} disabled />
                </div>
                <div className="form-field">
                  <label>Name</label>
                  <input value={patientData.name} disabled />
                </div>
                <div className="form-field">
                  <label>Gender</label>
                  <input value={patientData.gender} disabled />
                </div>
              </div>
              <div className="billing-grid-3" style={{ marginTop: '10px' }}>
                <div className="form-field">
                  <label>Age</label>
                  <input value={patientData.age} disabled />
                </div>
                <div className="form-field">
                  <label>Phone</label>
                  <input value={patientData.phone} disabled />
                </div>
                <div className="form-field">
                  <label>Doctor</label>
                  <input value={patientData.doctor} disabled />
                </div>
              </div>
              <div className="form-field" style={{ marginTop: '10px' }}>
                <label>Address</label>
                <textarea rows="2" value={patientData.address} disabled />
              </div>
              <div className="billing-grid-3" style={{ marginTop: '10px' }}>
                <div className="form-field">
                  <label>Time</label>
                  <input type="time" value={patientData.time} disabled />
                </div>
                <div className="form-field">
                  <label>Relation (S/o / D/o / W/o)</label>
                  <input value={patientData.relation} disabled />
                </div>
                <div></div>
              </div>
            </div>

            <hr />

            {/* Charges Section */}
            <h4>Charges</h4>
            <div className="billing-row" style={{ alignItems: 'flex-end' }}>
              <div className="form-field" style={{ flex: '0 0 200px' }}>
                <label>Category</label>
                <select 
                  value={selectedCategory} 
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  disabled={!patientLoaded}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                  ))}
                </select>
              </div>
              <div className="form-field" style={{ flex: '1 1 auto', minWidth: '250px' }}>
                <label>Charge</label>
                <select 
                  value={selectedCharge} 
                  onChange={(e) => handleChargeSelect(e.target.value)}
                  disabled={!patientLoaded || !selectedCategory}
                >
                  <option value="">Select Charge</option>
                  {filteredCharges.map(charge => (
                    <option key={charge.id} value={charge.id}>
                      {charge.charge_name} — ₹{charge.default_rate}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field" style={{ flex: '0 0 80px' }}>
                <label>Qty</label>
                <input 
                  type="number" 
                  value={qty} 
                  onChange={(e) => setQty(Number(e.target.value))} 
                  disabled={!patientLoaded}
                  min="1"
                />
              </div>
              <div className="form-field" style={{ flex: '0 0 120px' }}>
                <label>Rate</label>
                <input 
                  type="number" 
                  value={rate} 
                  onChange={(e) => setRate(Number(e.target.value))} 
                  disabled={!patientLoaded}
                />
              </div>
              <div className="form-field" style={{ flex: '0 0 80px' }}>
                <label>&nbsp;</label>
                <button 
                  className="btn-primary" 
                  onClick={addCharge} 
                  disabled={!patientLoaded || !selectedCharge}
                  style={{ width: '100%' }}
                >
                  Add
                </button>
              </div>
            </div>

            {/* Bill Items Table */}
            <table className="bill-table">
              <thead>
                <tr>
                  <th>Charge</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {billItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="no-data">No charges added</td>
                  </tr>
                ) : (
                  billItems.map(item => (
                    <tr key={item.id}>
                      <td>{item.charge_name}</td>
                      <td>{item.qty}</td>
                      <td>₹{item.rate}</td>
                      <td>₹{item.amount}</td>
                      <td>
                        <button className="btn-danger-small" onClick={() => removeCharge(item.id)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Totals */}
            <div className="billing-row" style={{ justifyContent: 'flex-end', marginTop: '10px' }}>
              <div className="form-field" style={{ width: '150px' }}>
                <label>Discount (₹)</label>
                <input 
                  type="number" 
                  value={discount} 
                  onChange={(e) => setDiscount(Number(e.target.value))} 
                  min="0"
                />
              </div>
              <div className="form-field" style={{ width: '200px' }}>
                <label>Total Amount (₹)</label>
                <input value={calculateTotal()} disabled />
              </div>
            </div>

            {/* Bill Type and Conditional Fields */}
            <div className="billing-grid-3" style={{ marginTop: '15px' }}>
              <div className="form-field">
                <label>Admit Date</label>
                <input type="date" value={admitDate} onChange={(e) => setAdmitDate(e.target.value)} />
              </div>
              <div className="form-field">
                <label>Discharge Date</label>
                <input type="date" value={dischargeDate} onChange={(e) => setDischargeDate(e.target.value)} />
              </div>
              <div className="form-field">
                <label>Bill Type</label>
                <select value={billType} onChange={(e) => setBillType(e.target.value)}>
                  <option>Cash</option>
                  <option>UPI</option>
                  <option>Credit/Debit Card</option>
                  <option>Ayushman</option>
                  <option>TPA</option>
                  <option>ESIS</option>
                  <option>ECHS</option>
                  <option>Golden Card</option>
                </select>
              </div>
            </div>

            {/* Conditional Fields */}
            {billType === 'UPI' && (
              <div className="billing-row" style={{ marginTop: '10px' }}>
                <div className="form-field" style={{ flex: 1 }}>
                  <label>UPI Reference</label>
                  <input value={upiReference} onChange={(e) => setUpiReference(e.target.value)} />
                </div>
              </div>
            )}

            {billType === 'Credit/Debit Card' && (
              <div className="billing-row" style={{ marginTop: '10px' }}>
                <div className="form-field" style={{ flex: 1 }}>
                  <label>Card Reference</label>
                  <input value={upiReference} onChange={(e) => setUpiReference(e.target.value)} />
                </div>
              </div>
            )}

            {billType === 'Ayushman' && (
              <div className="billing-grid-3" style={{ marginTop: '10px' }}>
                <div className="form-field">
                  <label>Aadhaar No</label>
                  <input value={aadhaarNo} onChange={(e) => setAadhaarNo(e.target.value)} />
                </div>
                <div className="form-field">
                  <label>Ayushman Card</label>
                  <input value={ayushmanCard} onChange={(e) => setAyushmanCard(e.target.value)} />
                </div>
                <div className="form-field">
                  <label>Ration Card</label>
                  <input value={rationCard} onChange={(e) => setRationCard(e.target.value)} />
                </div>
              </div>
            )}

            {billType === 'ECHS' && (
              <div className="billing-grid-3" style={{ marginTop: '10px' }}>
                <div className="form-field">
                  <label>Referral No</label>
                  <input value={echsReferralNo} onChange={(e) => setEchsReferralNo(e.target.value)} />
                </div>
                <div className="form-field">
                  <label>Service No</label>
                  <input value={echsServiceNo} onChange={(e) => setEchsServiceNo(e.target.value)} />
                </div>
                <div className="form-field">
                  <label>Claim ID</label>
                  <input value={echsClaimId} onChange={(e) => setEchsClaimId(e.target.value)} />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="form-actions" style={{ marginTop: '20px' }}>
              <button 
                className="btn-primary" 
                onClick={saveBill} 
                disabled={loading || !patientLoaded || billItems.length === 0}
              >
                {loading ? 'Saving...' : 'Save & Generate Bill'}
              </button>
              <button 
                className="btn-primary" 
                onClick={printReceipt}
                disabled={!patientLoaded || billItems.length === 0}
              >
                Print Receipt
              </button>
              <button className="btn-secondary" onClick={clearForm}>
                Clear
              </button>
              <button 
                className="btn-danger" 
                onClick={cancelBill}
                disabled={!formData.billId || loading}
                title={!formData.billId ? 'Load a bill to cancel it' : 'Cancel this bill (soft delete with reason)'}
              >
                Cancel Bill
              </button>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="billing-right-panel">
            <PatientSearch 
              onSelectPatient={loadPatient}
              showQuickReg={false}
              onRegisterClick={() => navigate('/registration')}
            />

            <hr style={{ margin: '16px 0' }} />

            {/* Today's Bills */}
            <h4>Today's Bills</h4>
            <div className="today-bills-list">
              {todayBills.length === 0 ? (
                <p className="no-data">No bills generated today</p>
              ) : (
                todayBills.map(bill => (
                  <div 
                    key={bill.id} 
                    className="bill-item"
                    onClick={() => loadBillById(bill.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="bill-header">
                      <strong>{bill.bill_no}</strong> — ₹{bill.net_amount}
                    </div>
                    <div className="bill-meta">
                      {bill.uhid} • {bill.patient_name}
                    </div>
                    <div className="bill-type">{bill.bill_type}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
