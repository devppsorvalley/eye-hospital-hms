// SQL queries for masters module
export const mastersQueries = {
  // Get all active doctors
  getDoctors: `
    SELECT id, name, is_active
    FROM doctors
    WHERE is_active = true
    ORDER BY name ASC
  `,

  // Get all active visit types
  getVisitTypes: `
    SELECT id, name, default_amount, is_active
    FROM visit_types
    WHERE is_active = true
    ORDER BY id ASC
  `,
};
