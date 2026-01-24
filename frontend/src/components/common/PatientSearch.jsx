import { useState } from 'react';
import axios from '../../api/axios';
import '../../styles/patient-search.css';

export default function PatientSearch({ onSelectPatient, showQuickReg = false, onQuickReg, onRegisterClick }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter search query');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`/patients?search=${searchQuery}`);
      setSearchResults(response.data.data || []);
      setShowModal(true);
    } catch (err) {
      setError('Failed to search patients');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = (patient) => {
    onSelectPatient(patient);
    setShowModal(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setError('');
  };

  return (
    <div className="patient-search-container">
      <div>
        <label>Search patient (UHID / Name / Phone / Village)</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by UHID, name, phone, village"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="btn-secondary" onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        {error && <div className="tiny-error">{error}</div>}
        {showQuickReg && (
          <button
            className="btn-secondary"
            style={{ marginTop: '8px', width: '100%' }}
            onClick={onQuickReg}
          >
            Quick Reg
          </button>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <h3>Search Results</h3>
            {searchResults.length === 0 ? (
              <div>
                <p>No patients found matching "{searchQuery}"</p>
                <button className="btn" onClick={() => { 
                  setShowModal(false); 
                  clearSearch(); 
                  if (onRegisterClick) onRegisterClick();
                }}>
                  Register Now
                </button>
              </div>
            ) : (
              <div>
                <table className="search-table">
                  <thead>
                    <tr>
                      <th>UHID</th>
                      <th>Name</th>
                      <th>Gender</th>
                      <th>Age</th>
                      <th>Phone</th>
                      <th>Village</th>
                      <th>Address</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((patient) => (
                      <tr key={patient.uhid}>
                        <td>{patient.uhid}</td>
                        <td>{patient.first_name} {patient.last_name}</td>
                        <td>{patient.gender}</td>
                        <td>{patient.age}</td>
                        <td>{patient.phone}</td>
                        <td>{patient.village}</td>
                        <td>{patient.address}</td>
                        <td>
                          <button className="btn-secondary btn-sm" onClick={() => handleSelectPatient(patient)}>
                            Select
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <button className="btn-secondary" style={{ marginTop: '12px' }} onClick={() => { setShowModal(false); clearSearch(); }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
