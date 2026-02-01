import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import axios from '../../api/axios';
import '../../styles/masters.css';

export default function ServiceChargesMaster() {
  const [formData, setFormData] = useState({
    category_id: '',
    charge_name: '',
    default_rate: '',
    is_active: true,
    description: '',
  });

  const [categories, setCategories] = useState([]);
  const [charges, setCharges] = useState([]);
  const [filteredCharges, setFilteredCharges] = useState([]);
  const [recentCharges, setRecentCharges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchCharges();
  }, []);

  useEffect(() => {
    // Filter charges based on search term
    if (searchTerm.trim()) {
      const filtered = charges.filter(charge =>
        charge.charge_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        charge.category_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCharges(filtered);
    } else {
      setFilteredCharges(charges);
    }
  }, [searchTerm, charges]);

  useEffect(() => {
    // Update recent charges (last 5)
    setRecentCharges(charges.slice(0, 5));
  }, [charges]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/billing/masters/categories');
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      alert('Failed to load categories');
    }
  };

  const fetchCharges = async () => {
    try {
      const response = await axios.get('/billing/masters/service-charges');
      const chargesData = response.data.charges || [];
      setCharges(chargesData);
      setFilteredCharges(chargesData);
    } catch (error) {
      console.error('Failed to fetch charges:', error);
      alert('Failed to load service charges');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category_id) {
      alert('Please select a category');
      return;
    }

    if (!formData.charge_name.trim()) {
      alert('Please enter charge name');
      return;
    }

    if (!formData.default_rate || parseFloat(formData.default_rate) < 0) {
      alert('Please enter a valid rate');
      return;
    }

    try {
      setLoading(true);

      const submitData = {
        category_id: parseInt(formData.category_id),
        charge_name: formData.charge_name.trim(),
        default_rate: parseFloat(formData.default_rate),
        is_active: formData.is_active,
        description: formData.description?.trim() || null,
      };

      if (editingId) {
        // Update existing charge
        await axios.put(`/billing/masters/service-charges/${editingId}`, submitData);
        alert('Service charge updated successfully');
      } else {
        // Create new charge
        await axios.post('/billing/masters/service-charges', submitData);
        alert('Service charge created successfully');
      }

      clearForm();
      fetchCharges();
    } catch (error) {
      console.error('Failed to save charge:', error);
      const errorMsg = error.response?.data?.message || error.message;
      alert('Failed to save charge: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const editCharge = (charge) => {
    setFormData({
      category_id: charge.category_id.toString(),
      charge_name: charge.charge_name,
      default_rate: charge.default_rate,
      is_active: charge.is_active,
      description: charge.description || '',
    });
    setEditingId(charge.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteCharge = async (id, name) => {
    const confirmation = window.confirm(
      `Are you sure you want to delete "${name}"?\n\nThis will soft-delete the charge and it won't appear in billing.`
    );

    if (!confirmation) return;

    try {
      setLoading(true);
      await axios.delete(`/billing/masters/service-charges/${id}`);
      alert('Service charge deleted successfully');
      fetchCharges();
    } catch (error) {
      console.error('Failed to delete charge:', error);
      const errorMsg = error.response?.data?.message || error.message;
      alert('Failed to delete charge: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setFormData({
      category_id: '',
      charge_name: '',
      default_rate: '',
      is_active: true,
      description: '',
    });
    setEditingId(null);
  };

  return (
    <Layout>
      <div className="masters-container">
        {/* LEFT PANEL */}
        <div className="masters-left-panel">
          <div className="masters-panel">
            <h2>{editingId ? 'Update' : 'Add'} Service Charge</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-grid-3">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.category_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Charge Name *</label>
                  <input
                    type="text"
                    value={formData.charge_name}
                    onChange={(e) => setFormData({ ...formData, charge_name: e.target.value })}
                    placeholder="e.g. OPD Consultation"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Default Rate (₹) *</label>
                  <input
                    type="number"
                    value={formData.default_rate}
                    onChange={(e) => setFormData({ ...formData, default_rate: e.target.value })}
                    placeholder="e.g. 150"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="form-grid-3" style={{ marginTop: '12px' }}>
                <div className="form-group">
                  <label>Active</label>
                  <select
                    value={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '12px' }}>
                <label>Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Notes for billing staff..."
                  rows="2"
                />
              </div>

              <div className="form-actions" style={{ marginTop: '16px' }}>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : editingId ? 'Update Charge' : 'Add Charge'}
                </button>
                {editingId && (
                  <button type="button" className="btn-secondary" onClick={clearForm}>
                    Cancel Edit
                  </button>
                )}
                <button type="button" className="btn-secondary" onClick={clearForm}>
                  Clear Form
                </button>
              </div>
            </form>

            <hr style={{ margin: '20px 0' }} />

            {/* CHARGE LIST */}
            <div className="charge-list-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0 }}>Service Charges List ({filteredCharges.length})</h3>
                <input
                  type="text"
                  placeholder="Search charges..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '250px', padding: '6px 10px' }}
                />
              </div>

              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Charge Name</th>
                      <th>Rate (₹)</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th className="actions-col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCharges.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                          {searchTerm ? 'No charges found matching your search' : 'No charges available'}
                        </td>
                      </tr>
                    ) : (
                      filteredCharges.map((charge, index) => (
                        <tr key={charge.id} className={editingId === charge.id ? 'editing-row' : ''}>
                          <td>{index + 1}</td>
                          <td>{charge.charge_name}</td>
                          <td>₹{parseFloat(charge.default_rate).toFixed(2)}</td>
                          <td>{charge.category_name}</td>
                          <td>
                            <span className={`status-badge ${charge.is_active ? 'active' : 'inactive'}`}>
                              {charge.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="actions-col">
                            <button
                              className="btn-small btn-secondary"
                              onClick={() => editCharge(charge)}
                              disabled={loading}
                            >
                              Edit
                            </button>
                            <button
                              className="btn-small btn-danger"
                              onClick={() => deleteCharge(charge.id, charge.charge_name)}
                              disabled={loading}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="masters-right-panel">
          <div className="masters-panel">
            <h3>Recently Added Charges</h3>

            {recentCharges.length === 0 ? (
              <p className="no-data">No charges added yet</p>
            ) : (
              recentCharges.map((charge) => (
                <div
                  key={charge.id}
                  className="recent-item"
                  onClick={() => editCharge(charge)}
                  style={{ cursor: 'pointer' }}
                  title="Click to edit"
                >
                  <div className="recent-item-name">{charge.charge_name}</div>
                  <div className="recent-item-meta">
                    ₹{parseFloat(charge.default_rate).toFixed(2)} • {charge.category_name}
                  </div>
                  <div className="recent-item-status">
                    <span className={`status-badge ${charge.is_active ? 'active' : 'inactive'}`}>
                      {charge.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))
            )}

            <hr style={{ margin: '16px 0' }} />

            <div className="info-box">
              <h4>Quick Guide</h4>
              <ul style={{ fontSize: '13px', color: '#555', paddingLeft: '20px' }}>
                <li>Category must be selected first</li>
                <li>Charges are grouped by category in billing</li>
                <li>Delete performs soft-delete (keeps history)</li>
                <li>Click recent items to edit them</li>
                <li>Inactive charges won't appear in billing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
