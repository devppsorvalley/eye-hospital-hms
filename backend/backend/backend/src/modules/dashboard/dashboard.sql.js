/**
 * Dashboard SQL Queries
 * Metrics and KPIs for dashboard
 */

export const dashboardQueries = {
  // Total registrations (all time and today)
  getTotalRegistrations: `
    SELECT COUNT(*) as total
    FROM patients
    WHERE deleted_at IS NULL;
  `,

  getTodayRegistrations: `
    SELECT COUNT(*) as total
    FROM patients
    WHERE deleted_at IS NULL
      AND DATE(created_at) = CURRENT_DATE;
  `,

  // Total OPD visits
  getTotalOPDVisits: `
    SELECT COUNT(*) as total
    FROM opd_queue;
  `,

  getTodayOPDVisits: `
    SELECT COUNT(*) as total
    FROM opd_queue
    WHERE visit_date = CURRENT_DATE;
  `,

  // OPD visits by status
  getOPDByStatus: `
    SELECT 
      status,
      COUNT(*) as count
    FROM opd_queue
    WHERE visit_date = CURRENT_DATE
    GROUP BY status;
  `,

  // OPD visits per doctor (today)
  getOPDPerDoctor: `
    SELECT 
      d.id,
      d.name,
      COUNT(o.id) as visit_count
    FROM doctors d
    LEFT JOIN opd_queue o ON d.id = o.doctor_id AND o.visit_date = CURRENT_DATE
    WHERE d.is_active = true
    GROUP BY d.id, d.name
    ORDER BY visit_count DESC;
  `,

  // OPD visits per doctor (all time)
  getOPDPerDoctorAllTime: `
    SELECT 
      d.id,
      d.name,
      COUNT(o.id) as visit_count
    FROM doctors d
    LEFT JOIN opd_queue o ON d.id = o.doctor_id
    WHERE d.is_active = true
    GROUP BY d.id, d.name
    ORDER BY visit_count DESC;
  `,

  // Total billing amount (today and all time)
  getTotalBillingAmount: `
    SELECT 
      SUM(net_amount) as total_amount,
      COUNT(*) as total_bills
    FROM bills
    WHERE is_deleted = false;
  `,

  getTodayBillingAmount: `
    SELECT 
      SUM(net_amount) as total_amount,
      COUNT(*) as total_bills
    FROM bills
    WHERE is_deleted = false
      AND bill_date = CURRENT_DATE;
  `,

  // Billing by bill type
  getBillingByType: `
    SELECT 
      bill_type,
      COUNT(*) as count,
      SUM(net_amount) as total_amount
    FROM bills
    WHERE is_deleted = false AND bill_date = CURRENT_DATE
    GROUP BY bill_type
    ORDER BY total_amount DESC;
  `,

  // Recent consultations
  getRecentConsultations: `
    SELECT 
      c.id,
      c.uhid,
      CONCAT(p.first_name, ' ', p.last_name) as patient_name,
      d.name as doctor_name,
      c.diagnosis,
      c.created_at
    FROM consultations c
    LEFT JOIN patients p ON c.uhid = p.uhid
    LEFT JOIN doctors d ON c.doctor_id = d.id
    ORDER BY c.created_at DESC
    LIMIT 10;
  `,

  // Consultations count by doctor
  getConsultationsByDoctor: `
    SELECT 
      d.id,
      d.name,
      COUNT(c.id) as consultation_count
    FROM doctors d
    LEFT JOIN consultations c ON d.id = c.doctor_id
    WHERE d.is_active = true
    GROUP BY d.id, d.name
    ORDER BY consultation_count DESC;
  `,

  // Patient registration trends (last 7 days)
  getRegistrationTrend: `
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as registrations
    FROM patients
    WHERE deleted_at IS NULL
      AND created_at >= CURRENT_DATE - INTERVAL '6 days'
    GROUP BY DATE(created_at)
    ORDER BY DATE(created_at);
  `,

  // OPD visit trends (last 7 days)
  getOPDTrend: `
    SELECT 
      visit_date as date,
      COUNT(*) as visits
    FROM opd_queue
    WHERE visit_date >= CURRENT_DATE - INTERVAL '6 days'
    GROUP BY visit_date
    ORDER BY visit_date;
  `,

  // Billing trends (last 7 days)
  getBillingTrend: `
    SELECT 
      bill_date as date,
      COUNT(*) as bills,
      SUM(net_amount) as amount
    FROM bills
    WHERE is_deleted = false
      AND bill_date >= CURRENT_DATE - INTERVAL '6 days'
    GROUP BY bill_date
    ORDER BY bill_date;
  `,

  // Common services (most billed)
  getCommonServices: `
    SELECT 
      bi.charge_name,
      bi.category,
      COUNT(*) as service_count,
      SUM(bi.amount) as total_revenue
    FROM bill_items bi
    LEFT JOIN bills b ON bi.bill_id = b.id
    WHERE b.is_deleted = false AND b.bill_date >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY bi.charge_name, bi.category
    ORDER BY service_count DESC
    LIMIT 10;
  `,

  // Patient demographics (village distribution)
  getPatientDemographics: `
    SELECT 
      village,
      COUNT(*) as count
    FROM patients
    WHERE deleted_at IS NULL
    GROUP BY village
    ORDER BY count DESC;
  `,

  // Follow-up vs New patient visits
  getFollowUpVsNew: `
    SELECT 
      visit_type,
      COUNT(*) as count
    FROM (
      SELECT 
        o.id,
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM opd_queue o2 
            WHERE o2.uhid = o.uhid 
              AND o2.visit_date < o.visit_date
              AND o2.id != o.id
          ) THEN 'Follow-up'
          ELSE 'New'
        END as visit_type
      FROM opd_queue o
      WHERE o.visit_date = CURRENT_DATE
    ) subq
    GROUP BY visit_type;
  `,

  // Active consultations (not yet billed)
  getActiveConsultations: `
    SELECT COUNT(*) as count
    FROM consultations c
    WHERE NOT EXISTS (
      SELECT 1 FROM bills b WHERE b.opd_id = c.opd_id AND b.is_deleted = false
    );
  `,

  // System health check
  getDatabaseStats: `
    SELECT 
      (SELECT COUNT(*) FROM patients WHERE deleted_at IS NULL) as total_patients,
      (SELECT COUNT(*) FROM doctors WHERE is_active = true) as active_doctors,
      (SELECT COUNT(*) FROM users WHERE is_active = true) as active_users,
      (SELECT COUNT(*) FROM opd_queue) as total_opd_visits,
      (SELECT COUNT(*) FROM consultations) as total_consultations,
      (SELECT COUNT(*) FROM bills WHERE is_deleted = false) as total_bills,
      NOW() as system_time;
  `,
};
