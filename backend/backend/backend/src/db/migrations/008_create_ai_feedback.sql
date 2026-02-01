-- Migration: Create AI Feedback table for training data collection
-- This table stores doctor feedback on AI-generated recommendations

CREATE TABLE IF NOT EXISTS ai_feedback (
  id SERIAL PRIMARY KEY,
  consultation_id INTEGER REFERENCES consultations(id) ON DELETE SET NULL,
  doctor_id INTEGER NOT NULL,
  patient_uhid VARCHAR(10),
  patient_age INTEGER,
  patient_gender VARCHAR(10),
  diagnosis TEXT,
  icd_codes TEXT[], -- Array of ICD codes used
  ai_protocol_text TEXT NOT NULL, -- The complete AI-generated recommendation
  ai_protocol_version VARCHAR(20) DEFAULT 'v1.0',
  feedback_type VARCHAR(20) NOT NULL CHECK (feedback_type IN ('helpful', 'not_helpful')),
  additional_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for analytics
CREATE INDEX IF NOT EXISTS idx_ai_feedback_consultation ON ai_feedback(consultation_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_doctor ON ai_feedback(doctor_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_type ON ai_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_created ON ai_feedback(created_at);

COMMENT ON TABLE ai_feedback IS 'Stores doctor feedback on AI recommendations for model training';
COMMENT ON COLUMN ai_feedback.feedback_type IS 'Whether doctor found the AI protocol helpful or not';
COMMENT ON COLUMN ai_feedback.ai_protocol_version IS 'Version of AI algorithm used for tracking iterations';
