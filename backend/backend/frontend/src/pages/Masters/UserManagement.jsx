import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import axios from '../../api/axios';
import '../../styles/masters.css';

export default function UserManagement() {
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    role: '',
    mobile: '',
    is_active: true,
    password: '',
  });

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchRoles();
    fetchUsers();
  }, []);

  const fetchRoles = async () => {
    try {
      // Hardcoded roles for MVP as per spec
      setRoles([
        { id: 1, name: 'ADMIN' },
        { id: 2, name: 'DOCTOR' },
        { id: 3, name: 'RECEPTION' },
        { id: 4, name: 'BILLING' },
      ]);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/users');
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      alert('Failed to load users');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      alert('Please enter username');
      return;
    }

    if (!formData.full_name.trim()) {
      alert('Please enter full name');
      return;
    }

    if (!formData.role) {
      alert('Please select a role');
      return;
    }

    if (!editingId && !formData.password) {
      alert('Password is required for new users');
      return;
    }

    try {
      setLoading(true);

      const submitData = {
        username: formData.username.trim().toLowerCase(),
        full_name: formData.full_name.trim(),
        role: formData.role,
        mobile: formData.mobile?.trim() || null,
        is_active: formData.is_active,
      };

      if (editingId) {
        // Update existing user
        if (formData.password) {
          submitData.password = formData.password;
        }
        await axios.put(`/users/${editingId}`, submitData);
        alert('User updated successfully');
      } else {
        // Create new user
        submitData.password = formData.password;
        await axios.post('/users', submitData);
        alert('User created successfully');
      }

      clearForm();
      fetchUsers();
    } catch (error) {
      console.error('Failed to save user:', error);
      const errorMsg = error.response?.data?.message || error.message;
      alert('Failed to save user: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const editUser = (user) => {
    setFormData({
      username: user.username,
      full_name: user.full_name || user.username,
      role: user.role,
      mobile: user.mobile || '',
      is_active: user.is_active,
      password: '', // Don't populate password for security
    });
    setEditingId(user.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleUserStatus = async (user) => {
    const action = user.is_active ? 'disable' : 'enable';
    const confirmation = window.confirm(
      `Are you sure you want to ${action} user "${user.username}"?`
    );

    if (!confirmation) return;

    try {
      setLoading(true);
      await axios.patch(`/users/${user.id}/status`, {
        is_active: !user.is_active,
      });
      alert(`User ${action}d successfully`);
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user status:', error);
      const errorMsg = error.response?.data?.message || error.message;
      alert('Failed to update user status: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (user) => {
    const newPassword = window.prompt(
      `Enter new password for "${user.username}":`,
      ''
    );

    if (!newPassword || newPassword.length < 6) {
      if (newPassword !== null) {
        alert('Password must be at least 6 characters');
      }
      return;
    }

    try {
      setLoading(true);
      await axios.patch(`/users/${user.id}/password`, {
        password: newPassword,
      });
      alert('Password reset successfully');
    } catch (error) {
      console.error('Failed to reset password:', error);
      const errorMsg = error.response?.data?.message || error.message;
      alert('Failed to reset password: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id, username) => {
    const confirmation = window.confirm(
      `Are you sure you want to delete user "${username}"?\n\nThis action cannot be undone.`
    );

    if (!confirmation) return;

    try {
      setLoading(true);
      await axios.delete(`/users/${id}`);
      alert('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      const errorMsg = error.response?.data?.message || error.message;
      alert('Failed to delete user: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setFormData({
      username: '',
      full_name: '',
      role: '',
      mobile: '',
      is_active: true,
      password: '',
    });
    setEditingId(null);
  };

  return (
    <Layout>
      <div className="masters-container">
        {/* LEFT PANEL */}
        <div className="masters-left-panel">
          <div className="masters-panel">
            <h2>{editingId ? 'Update' : 'Add'} User</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-grid-3">
                <div className="form-group">
                  <label>Username *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="e.g. dr.sharma"
                    required
                    disabled={editingId !== null}
                  />
                  {editingId && (
                    <small style={{ color: '#999' }}>Username cannot be changed</small>
                  )}
                </div>

                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="e.g. Dr. Rajesh Sharma"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                  >
                    <option value="">Select role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.name}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-grid-3" style={{ marginTop: '12px' }}>
                <div className="form-group">
                  <label>Mobile</label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="+91-XXXXXXXXXX"
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Password {!editingId && '*'}</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingId ? 'Leave blank to keep unchanged' : 'Min 6 characters'}
                    required={!editingId}
                    minLength="6"
                  />
                  {editingId && (
                    <small style={{ color: '#999' }}>Leave blank to keep current password</small>
                  )}
                </div>
              </div>

              <div className="form-actions" style={{ marginTop: '16px' }}>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : editingId ? 'Update User' : 'Add User'}
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

            {/* USER LIST */}
            <div className="user-list-section">
              <h3 style={{ marginBottom: '12px' }}>User List ({users.length})</h3>

              <div className="user-row header">
                <div>#</div>
                <div>Username</div>
                <div>Full Name</div>
                <div>Role</div>
                <div>Status</div>
                <div style={{ textAlign: 'right' }}>Actions</div>
              </div>

              {users.length === 0 ? (
                <p className="no-data">No users found</p>
              ) : (
                users.map((user, index) => (
                  <div key={user.id} className="user-row">
                    <div>{index + 1}</div>
                    <div>{user.username}</div>
                    <div className="user-fullname">{user.full_name || user.username}</div>
                    <div className="user-role">
                      <span className="status-badge" style={{ background: '#e3f2fd', color: '#1976d2' }}>
                        {user.role}
                      </span>
                    </div>
                    <div>
                      <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="user-actions" style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                      <button
                        className="btn-small btn-secondary"
                        onClick={() => editUser(user)}
                        disabled={loading}
                        title="Edit user"
                      >
                        Edit
                      </button>
                      <button
                        className={`btn-small ${user.is_active ? 'btn-danger' : 'btn-primary'}`}
                        onClick={() => toggleUserStatus(user)}
                        disabled={loading}
                        title={user.is_active ? 'Disable user' : 'Enable user'}
                      >
                        {user.is_active ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        className="btn-small btn-secondary"
                        onClick={() => resetPassword(user)}
                        disabled={loading}
                        title="Reset password"
                      >
                        Reset Pwd
                      </button>
                      <button
                        className="btn-small btn-danger"
                        onClick={() => deleteUser(user.id, user.username)}
                        disabled={loading}
                        title="Delete user"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="masters-right-panel">
          <div className="masters-panel">
            <h3>System Notes</h3>

            <div className="info-box">
              <h4>Roles & Permissions</h4>
              <ul style={{ fontSize: '13px', color: '#555', paddingLeft: '20px', marginBottom: '12px' }}>
                <li><strong>ADMIN:</strong> Full system access</li>
                <li><strong>DOCTOR:</strong> Consultation & OPD</li>
                <li><strong>RECEPTION:</strong> Registration & OPD</li>
                <li><strong>BILLING:</strong> Billing module access</li>
              </ul>
            </div>

            <div className="info-box" style={{ marginTop: '12px' }}>
              <h4>User Management Rules</h4>
              <ul style={{ fontSize: '13px', color: '#555', paddingLeft: '20px' }}>
                <li>Username must be unique</li>
                <li>Disabled users cannot log in</li>
                <li>One role per user (MVP)</li>
                <li>Username cannot be changed after creation</li>
                <li>Password must be at least 6 characters</li>
              </ul>
            </div>

            <div className="info-box" style={{ marginTop: '12px' }}>
              <h4>Active Users Summary</h4>
              <div style={{ fontSize: '14px', marginTop: '8px' }}>
                {roles.map((role) => {
                  const count = users.filter(u => u.role === role.name && u.is_active).length;
                  return (
                    <div key={role.id} style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{role.name}:</span>
                      <strong>{count}</strong>
                    </div>
                  );
                })}
                <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #ddd' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600' }}>
                  <span>Total Active:</span>
                  <span>{users.filter(u => u.is_active).length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
