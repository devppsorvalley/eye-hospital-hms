// API endpoint for submitting AI feedback
import { pool } from '../../config/db.js';

export const submitAIFeedback = async (req, res) => {
  try {
    const {
      consultation_id,
      diagnosis,
      icd_codes,
      feedback_type,
      ai_protocol_text,
      patient_age,
      patient_gender
    } = req.body;

    const doctor_id = req.user.id; // From auth middleware
    
    // Validate feedback type
    if (!['helpful', 'not_helpful'].includes(feedback_type)) {
      return res.status(400).json({ message: 'Invalid feedback type' });
    }

    // Validate required fields
    if (!ai_protocol_text) {
      return res.status(400).json({ message: 'AI protocol text is required' });
    }

    // Get patient UHID from consultation if provided
    let patient_uhid = null;
    if (consultation_id) {
      const consultResult = await pool.query(
        'SELECT uhid FROM consultations WHERE id = $1',
        [consultation_id]
      );
      patient_uhid = consultResult.rows[0]?.uhid;
    }

    // Insert feedback with complete AI protocol
    const result = await pool.query(
      `INSERT INTO ai_feedback (
        consultation_id, doctor_id, patient_uhid, patient_age, 
        patient_gender, diagnosis, icd_codes, ai_protocol_text, 
        feedback_type, ai_protocol_version
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, feedback_type, created_at`,
      [
        consultation_id,
        doctor_id,
        patient_uhid,
        patient_age,
        patient_gender,
        diagnosis,
        icd_codes, // Array of ICD codes
        ai_protocol_text, // Complete AI-generated protocol
        feedback_type,
        'v1.0' // Protocol version
      ]
    );

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: result.rows[0]
    });
  } catch (error) {
    console.error('Error submitting AI feedback:', error);
    res.status(500).json({ message: 'Failed to submit feedback' });
  }
};

// Get AI feedback statistics (for admin/analytics)
export const getAIFeedbackStats = async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        feedback_type,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
      FROM ai_feedback
      GROUP BY feedback_type
    `);

    const topDoctors = await pool.query(`
      SELECT 
        u.username,
        COUNT(*) as feedback_count,
        SUM(CASE WHEN af.feedback_type = 'helpful' THEN 1 ELSE 0 END) as helpful_count
      FROM ai_feedback af
      JOIN users u ON af.doctor_id = u.id
      GROUP BY u.id, u.username
      ORDER BY feedback_count DESC
      LIMIT 10
    `);

    res.json({
      overall_stats: stats.rows,
      top_contributors: topDoctors.rows
    });
  } catch (error) {
    console.error('Error fetching AI feedback stats:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};
