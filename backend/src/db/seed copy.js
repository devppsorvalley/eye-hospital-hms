import bcryptjs from 'bcryptjs';
import { pool } from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Comprehensive seed script for HMS database
 * Populates all master data and test users
 */

async function seedDatabase() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('🌱 Starting database seeding...\n');

    // ============================================================================
    // 1. ROLES
    // ============================================================================
    console.log('📋 Seeding roles...');
    const roles = ['ADMIN', 'DOCTOR', 'OPERATOR'];
    for (const role of roles) {
      await client.query(
        `INSERT INTO roles (name) VALUES ($1) 
         ON CONFLICT (name) DO NOTHING`,
        [role]
      );
    }
    console.log('✅ Roles seeded\n');

    // ============================================================================
    // 2. USERS
    // ============================================================================
    console.log('👤 Seeding users...');
    const users = [
      {
        username: 'admin',
        password: 'admin123',
        role: 'ADMIN',
      },
      {
        username: 'doctor',
        password: 'doctor123',
        role: 'DOCTOR',
      },
      {
        username: 'operator',
        password: 'operator123',
        role: 'OPERATOR',
      },
    ];

    for (const user of users) {
      const roleResult = await client.query('SELECT id FROM roles WHERE name = $1', [
        user.role,
      ]);
      const roleId = roleResult.rows[0]?.id;

      const passwordHash = await bcryptjs.hash(user.password, 10);

      await client.query(
        `INSERT INTO users (username, password_hash, role_id, is_active) 
         VALUES ($1, $2, $3, true)
         ON CONFLICT (username) DO NOTHING`,
        [user.username, passwordHash, roleId]
      );
      console.log(`  ✓ ${user.username} (${user.role})`);
    }
    console.log('✅ Users seeded\n');

    // ============================================================================
    // 3. DOCTORS
    // ============================================================================
    console.log('👨‍⚕️ Seeding doctors...');
    const doctors = [
      'Dr. Aditya',
      'Dr. Priya Mehta',
      'Dr. Vikram Patel',
      'Dr. Anjali Singh',
    ];
    for (const doctorName of doctors) {
      await client.query(
        `INSERT INTO doctors (name, is_active) VALUES ($1, true)`,
        [doctorName]
      );
      console.log(`  ✓ ${doctorName}`);
    }
    console.log('✅ Doctors seeded\n');

    // ============================================================================
    // 4. VISIT TYPES
    // ============================================================================
    console.log('🏥 Seeding visit types...');
    const visitTypes = [
      { name: 'New', amount: 30 },
      { name: 'Follow-up', amount: 0 },
      { name: 'Express', amount: 250 },
      { name: 'ECHS', amount: 300 },
    ];
    for (const vt of visitTypes) {
      await client.query(
        `INSERT INTO visit_types (name, default_amount, is_active) VALUES ($1, $2, true)
         ON CONFLICT DO NOTHING`,
        [vt.name, vt.amount]
      );
      console.log(`  ✓ ${vt.name} (₹${vt.amount})`);
    }
    console.log('✅ Visit types seeded\n');

    // ============================================================================
    // 5. SERVICE CATEGORIES
    // ============================================================================
    console.log('🏷️ Seeding service categories...');
    const categories = [
      'Cash/UPI/Card',
      'Ayushman',
      'ECHS',
      'Medication',
      'Accessories',
    ];
    for (const cat of categories) {
      await client.query(
        `INSERT INTO service_categories (name, is_active) VALUES ($1, true)
         ON CONFLICT DO NOTHING`,
        [cat]
      );
      console.log(`  ✓ ${cat}`);
    }
    console.log('✅ Categories seeded\n');
/*
    // ============================================================================
    // 6. SERVICE CHARGES
    // ============================================================================
    console.log('💰 Seeding service charges...');
    const charges = [
      { category: 'Consultation', name: 'General Checkup', rate: 200 },
      { category: 'Consultation', name: 'Specialist Consultation', rate: 500 },
      { category: 'Tests & Diagnostics', name: 'Visual Acuity Test', rate: 100 },
      { category: 'Tests & Diagnostics', name: 'Tonometry', rate: 150 },
      { category: 'Tests & Diagnostics', name: 'OCT Scan', rate: 800 },
      { category: 'Surgery', name: 'Cataract Surgery (PHACO)', rate: 5000 },
      { category: 'Surgery', name: 'Retinal Surgery', rate: 8000 },
      { category: 'Medication', name: 'Antibiotic Eye Drops', rate: 150 },
      { category: 'Accessories', name: 'Spectacles Frame', rate: 500 },
      { category: 'Accessories', name: 'Contact Lens', rate: 300 },
    ];

    for (const charge of charges) {
      const catResult = await client.query(
        'SELECT id FROM service_categories WHERE name = $1',
        [charge.category]
      );
      const categoryId = catResult.rows[0]?.id;

      await client.query(
        `INSERT INTO service_charges (category_id, charge_name, default_rate, is_active, description)
         VALUES ($1, $2, $3, true, $4)
         ON CONFLICT DO NOTHING`,
        [categoryId, charge.name, charge.rate, `${charge.name} service`]
      );
      console.log(`  ✓ ${charge.name} (₹${charge.rate})`);
    }
    console.log('✅ Service charges seeded\n');
*/
    // ============================================================================
    // 7. ICD MASTER
    // ============================================================================
    console.log('📋 Seeding ICD codes...');
    const icdCodes = [
  // REFRACTIVE ERRORS & ACCOMMODATION (H52)
  { code: 'H52.0', desc: 'Hypermetropia (Farsightedness)' },
  { code: 'H52.1', desc: 'Myopia (Nearsightedness)' },
  { code: 'H52.2', desc: 'Astigmatism' },
  { code: 'H52.3', desc: 'Anisometropia and Aniseikonia' },
  { code: 'H52.4', desc: 'Presbyopia' },

  // CATARACT (H25–H28)
  { code: 'H25.0', desc: 'Senile Cataract' },
  { code: 'H25.1', desc: 'Senile Nuclear Cataract' },
  { code: 'H25.2', desc: 'Senile Cortical Cataract' },
  { code: 'H25.9', desc: 'Senile Cataract, Unspecified' },
  { code: 'H26.0', desc: 'Infantile and Juvenile Cataract' },
  { code: 'H26.9', desc: 'Cataract, Unspecified' },
  { code: 'H28', desc: 'Cataract in Other Diseases' },

  // GLAUCOMA (H40–H42)
  { code: 'H40.0', desc: 'Glaucoma Suspect' },
  { code: 'H40.1', desc: 'Primary Open-Angle Glaucoma' },
  { code: 'H40.2', desc: 'Primary Angle-Closure Glaucoma' },
  { code: 'H40.3', desc: 'Secondary Glaucoma' },
  { code: 'H40.8', desc: 'Other Glaucoma' },
  { code: 'H42', desc: 'Glaucoma in Other Diseases' },

  // CONJUNCTIVA (H10–H13)
  { code: 'H10.0', desc: 'Mucopurulent Conjunctivitis' },
  { code: 'H10.1', desc: 'Acute Atopic Conjunctivitis' },
  { code: 'H10.4', desc: 'Chronic Conjunctivitis' },
  { code: 'H11.0', desc: 'Pterygium' },
  { code: 'H11.1', desc: 'Pinguecula' },

  // CORNEA (H16–H18)
  { code: 'H16.0', desc: 'Corneal Ulcer' },
  { code: 'H16.1', desc: 'Superficial Keratitis' },
  { code: 'H17', desc: 'Corneal Scars and Opacities' },
  { code: 'H18.6', desc: 'Keratoconus' },

  // UVEA / IRIS (H20–H22)
  { code: 'H20.0', desc: 'Acute and Subacute Iridocyclitis (Uveitis)' },
  { code: 'H20.9', desc: 'Uveitis, Unspecified' },
  { code: 'H21.0', desc: 'Hyphema' },

  // LENS DISORDERS (H27)
  { code: 'H27.0', desc: 'Aphakia' },
  { code: 'H27.1', desc: 'Dislocation of Lens' },

  // VITREOUS & RETINA (H33–H36, H43)
  { code: 'H33.0', desc: 'Retinal Detachment' },
  { code: 'H34.0', desc: 'Retinal Artery Occlusion' },
  { code: 'H34.8', desc: 'Retinal Vein Occlusion' },
  { code: 'H35.3', desc: 'Age-Related Macular Degeneration' },
  { code: 'H35.9', desc: 'Retinal Disorder, Unspecified' },
  { code: 'H36.0', desc: 'Diabetic Retinopathy' },
  { code: 'H43.1', desc: 'Vitreous Hemorrhage' },
  { code: 'H43.8', desc: 'Other Vitreous Disorders' },

  // OPTIC NERVE & VISUAL PATHWAY (H46–H47)
  { code: 'H46', desc: 'Optic Neuritis' },
  { code: 'H47.2', desc: 'Optic Atrophy' },

  // STRABISMUS & BINOCULAR MOVEMENT (H49–H50)
  { code: 'H49.0', desc: 'Oculomotor Nerve Palsy' },
  { code: 'H50.0', desc: 'Esotropia' },
  { code: 'H50.1', desc: 'Exotropia' },
  { code: 'H50.9', desc: 'Strabismus, Unspecified' },

  // AMBLYOPIA & VISUAL DISTURBANCES (H53–H54)
  { code: 'H53.0', desc: 'Amblyopia (Lazy Eye)' },
  { code: 'H53.1', desc: 'Subjective Visual Disturbances' },
  { code: 'H54', desc: 'Visual Impairment / Blindness' },

  // NYSTAGMUS & EYE MOVEMENT (H55)
  { code: 'H55', desc: 'Nystagmus' },

  // EYELID & LACRIMAL SYSTEM (H00–H06)
  { code: 'H00.0', desc: 'Hordeolum (Stye)' },
  { code: 'H01.0', desc: 'Blepharitis' },
  { code: 'H02.1', desc: 'Entropion and Trichiasis' },
  { code: 'H04.1', desc: 'Dry Eye Syndrome' },
  { code: 'H04.5', desc: 'Dacryocystitis' },

  // ORBIT & EYE PAIN (H05, H57)
  { code: 'H05.2', desc: 'Orbital Cellulitis' },
  { code: 'H57.1', desc: 'Eye Pain' },
  { code: 'H57.8', desc: 'Other Disorders of Eye and Adnexa' }
];

    for (const icd of icdCodes) {
      await client.query(
        `INSERT INTO icd_master (icd_code, description, is_active)
         VALUES ($1, $2, true)
         ON CONFLICT (icd_code) DO NOTHING`,
        [icd.code, icd.desc]
      );
      console.log(`  ✓ ${icd.code} - ${icd.desc}`);
    }
    console.log('✅ ICD codes seeded\n');

    // ============================================================================
    // 8. SAMPLE PATIENTS
    // ============================================================================
    console.log('👥 Seeding sample patients...');
    const patients = [
      {
        uhid: '9701',
        first_name: 'Ramya',
        last_name: 'Pant',
        gender: 'Female',
        dob: '1992-05-15',
        phone: '9876543210',
        district: 'Mumbai',
        address: '123, Main Street',
      },
      {
        uhid: '9702',
        first_name: 'Jagdish',
        last_name: 'Joshi',
        gender: 'Male',
        dob: '2015-06-20',
        phone: '9876543211',
        district: 'Pune',
        address: '456, Oak Avenue',
      },
      {
        uhid: '9703',
        first_name: 'Gungun',
        last_name: 'Chand',
        gender: 'Female',
        dob: '1995-08-10',
        phone: '9876543212',
        district: 'Bangalore',
        address: '789, Pine Road',
      },
    ];

    for (const patient of patients) {
      await client.query(
        `INSERT INTO patients (uhid, first_name, last_name, gender, dob, phone, district, address, registration_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE)
         ON CONFLICT (uhid) DO NOTHING`,
        [
          patient.uhid,
          patient.first_name,
          patient.last_name,
          patient.gender,
          patient.dob,
          patient.phone,
          patient.district,
          patient.address,
        ]
      );
      console.log(`  ✓ ${patient.first_name} ${patient.last_name} (UHID: ${patient.uhid})`);
    }
    console.log('✅ Sample patients seeded\n');

    await client.query('COMMIT');
    console.log('✅ Database seeding completed successfully!\n');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding database:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase().catch((err) => {
  console.error(err);
  process.exit(1);
});

