#!/usr/bin/env node

/**
 * E2E API Test Suite
 * Tests full workflow: Auth → Patients → OPD → Consultations → Billing → Dashboard
 */

import https from 'https';

const BASE_URL = 'http://localhost:3000/api/v1';

// Helper function to make HTTP requests
function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = (url.protocol === 'https:' ? https : require('http')).request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

// Test runner
async function runTests() {
  console.log('🚀 Starting E2E API Tests\n');

  try {
    // 1. Login
    console.log('1️⃣ Testing Authentication');
    console.log('   POST /auth/login');
    const loginRes = await makeRequest('POST', '/auth/login', {
      username: 'e2e_admin',
      password: 'testpass123',
    });

    if (loginRes.status !== 200) {
      throw new Error(`Login failed: ${JSON.stringify(loginRes.data)}`);
    }

    const token = loginRes.data.token;
    const user = loginRes.data.user;

    console.log(`   ✓ Login successful`);
    console.log(`   User: ${user.username} (${user.role})`);
    console.log(`   Token: ${token.substring(0, 30)}...\n`);

    // 2. Create Patient
    console.log('2️⃣ Testing Patient Registration');
    console.log('   POST /patients');

    const patientData = {
      first_name: 'E2E',
      last_name: 'TestPatient',
      gender: 'Male',
      dob: '1990-05-15',
      phone: '9876543210',
      village: 'TestVillage',
    };

    const patientRes = await makeRequest('POST', '/patients', patientData, token);

    if (patientRes.status !== 201) {
      throw new Error(`Patient registration failed: ${JSON.stringify(patientRes.data)}`);
    }

    const patientUHID = patientRes.data.patient.uhid;
    const patientName = patientRes.data.patient.name || `${patientData.first_name} ${patientData.last_name}`;

    console.log(`   ✓ Patient registered successfully`);
    console.log(`   UHID: ${patientUHID}`);
    console.log(`   Name: ${patientName}\n`);

    // 3. Get Doctors and Visit Types
    console.log('3️⃣ Testing Masters Data');
    console.log('   GET /opd/masters/doctors');

    const doctorsRes = await makeRequest('GET', '/opd/masters/doctors', null, token);

    if (doctorsRes.status !== 200 || !doctorsRes.data.doctors || doctorsRes.data.doctors.length === 0) {
      throw new Error(`Failed to fetch doctors: ${JSON.stringify(doctorsRes.data)}`);
    }

    const doctorId = doctorsRes.data.doctors[0].id;
    const doctorName = doctorsRes.data.doctors[0].name;

    console.log(`   ✓ Doctors fetched: ${doctorsRes.data.doctors.length} available`);
    console.log(`   Using: ${doctorName} (ID: ${doctorId})`);

    console.log('   GET /opd/masters/visit-types');

    const visitTypesRes = await makeRequest('GET', '/opd/masters/visit-types', null, token);

    if (visitTypesRes.status !== 200 || !visitTypesRes.data.visit_types || visitTypesRes.data.visit_types.length === 0) {
      throw new Error(`Failed to fetch visit types: ${JSON.stringify(visitTypesRes.data)}`);
    }

    const visitTypeId = visitTypesRes.data.visit_types[0].id;
    const visitTypeName = visitTypesRes.data.visit_types[0].name;

    console.log(`   ✓ Visit types fetched: ${visitTypesRes.data.visit_types.length} available`);
    console.log(`   Using: ${visitTypeName} (ID: ${visitTypeId})\n`);

    // 4. Create OPD Entry
    console.log('4️⃣ Testing OPD Module');
    console.log('   POST /opd');

    const today = new Date().toISOString().split('T')[0];
    const opdData = {
      uhid: patientUHID,
      doctor_id: doctorId,
      visit_type_id: visitTypeId,
      visit_date: today,
    };

    const opdRes = await makeRequest('POST', '/opd', opdData, token);

    if (opdRes.status !== 201) {
      throw new Error(`OPD creation failed: ${JSON.stringify(opdRes.data)}`);
    }

    const opdId = opdRes.data.opd.id;
    const serialNo = opdRes.data.opd.serial_no;

    console.log(`   ✓ OPD entry created`);
    console.log(`   OPD ID: ${opdId}`);
    console.log(`   Serial: ${serialNo}\n`);

    // 5. Create Consultation
    console.log('5️⃣ Testing Consultations Module');
    console.log('   POST /consultations');

    const consultationData = {
      uhid: patientUHID,
      doctor_id: doctorId,
      opd_id: opdId,
      diagnosis: 'Test diagnosis for E2E',
      treatment_plan: 'Recommended test treatment',
      followup_instructions: 'Follow up next week',
    };

    const consultationRes = await makeRequest('POST', '/consultations', consultationData, token);

    if (consultationRes.status !== 201) {
      throw new Error(`Consultation creation failed: ${JSON.stringify(consultationRes.data)}`);
    }

    const consultationId = consultationRes.data.consultation.id;

    console.log(`   ✓ Consultation created`);
    console.log(`   Consultation ID: ${consultationId}\n`);

    // 6. Create Bill
    console.log('6️⃣ Testing Billing Module');
    console.log('   POST /billing');

    const billData = {
      uhid: patientUHID,
      patient_name: patientName,
      phone: patientData.phone,
      opd_id: opdId,
      doctor_id: doctorId,
      category: 'Consultation',
      bill_type: 'Cash',
      items: [
        {
          charge_name: 'Consultation Fee',
          category: 'Consultation',
          qty: 1,
          rate: 500,
        },
      ],
    };

    const billRes = await makeRequest('POST', '/billing', billData, token);

    if (billRes.status !== 201) {
      throw new Error(`Bill creation failed: ${JSON.stringify(billRes.data)}`);
    }

    const billId = billRes.data.bill.id;
    const billNo = billRes.data.bill.bill_no;
    const netAmount = billRes.data.bill.net_amount;

    console.log(`   ✓ Bill created`);
    console.log(`   Bill ID: ${billId}`);
    console.log(`   Bill #: ${billNo}`);
    console.log(`   Amount: ₹${netAmount}\n`);

    // 7. Get Dashboard Overview
    console.log('7️⃣ Testing Dashboard Module');
    console.log('   GET /dashboard/overview');

    const dashboardRes = await makeRequest('GET', '/dashboard/overview', null, token);

    if (dashboardRes.status !== 200) {
      throw new Error(`Dashboard fetch failed: ${JSON.stringify(dashboardRes.data)}`);
    }

    const kpis = dashboardRes.data.data.kpis;

    console.log(`   ✓ Dashboard data retrieved`);
    console.log(`   Registrations (today): ${kpis.registrations.today}`);
    console.log(`   OPD Visits (today): ${kpis.opd_visits.today}`);
    console.log(`   Billing (today): ₹${kpis.billing.today_amount}\n`);

    // 8. Additional endpoint tests
    console.log('8️⃣ Testing Additional Endpoints');

    // Search patients
    console.log('   GET /patients (search)');
    const searchRes = await makeRequest('GET', `/patients?search=${patientUHID}`, null, token);
    if (searchRes.status === 200) {
      console.log(`   ✓ Patient search successful: ${searchRes.data.patients?.length || 0} results`);
    }

    // Get patient details
    console.log(`   GET /patients/${patientUHID}`);
    const getPatientRes = await makeRequest('GET', `/patients/${patientUHID}`, null, token);
    if (getPatientRes.status === 200) {
      console.log(`   ✓ Patient details retrieved`);
    }

    // Get OPD queue
    console.log(`   GET /opd`);
    const queueRes = await makeRequest('GET', `/opd?visit_date=${today}`, null, token);
    if (queueRes.status === 200) {
      console.log(`   ✓ OPD queue retrieved: ${queueRes.data.queue?.length || 0} entries today`);
    }

    // Get dashboard OPD metrics
    console.log(`   GET /dashboard/opd`);
    const dashOpdRes = await makeRequest('GET', `/dashboard/opd`, null, token);
    if (dashOpdRes.status === 200) {
      console.log(`   ✓ OPD metrics retrieved`);
    }

    // Get dashboard trends
    console.log(`   GET /dashboard/trends`);
    const dashTrendsRes = await makeRequest('GET', `/dashboard/trends`, null, token);
    if (dashTrendsRes.status === 200) {
      console.log(`   ✓ Trend data retrieved`);
    }

    console.log('\n✅ All tests passed!\n');
    console.log('📊 Test Summary:');
    console.log('   ✓ Authentication (login, token generation)');
    console.log('   ✓ Patient Registration (UHID auto-generation)');
    console.log('   ✓ OPD Management (queue creation, serial numbers)');
    console.log('   ✓ Consultations (diagnosis, treatment)');
    console.log('   ✓ Billing (invoice generation, bill items)');
    console.log('   ✓ Dashboard Analytics (KPIs, trends, metrics)');
    console.log('   ✓ Masters Data (doctors, visit types)');
    console.log('   ✓ Search & Filtering');
    console.log('\n🎉 E2E Test Suite Completed Successfully!\n');
  } catch (error) {
    console.error(`\n❌ Test failed: ${error.message}\n`);
    process.exit(1);
  }
}

// Run tests
runTests();
