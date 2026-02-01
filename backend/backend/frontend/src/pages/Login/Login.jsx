import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin } from '../../api/auth.api';
import { authStore } from '../../store/auth.store';
import '../../styles/login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiLogin(username, password);
      authStore.setAuth(response.token, response.user);
      
      // Redirect to role-based default route
      const defaultRoute = response.user.defaultRoute || '/dashboard';
      navigate(defaultRoute);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      setPassword('');
      setLoading(false);
    }
  };

  return (
    <>
      <header className="app-header">Seemant Eye Hospital — HMS</header>
      <div className="login-container">
        <div className="login-card">
          <div className="login-title">User Login</div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="username">User</label>
            <input
              id="username"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              autoFocus
              required
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div className="footer-note">Authorized users only</div>
          </form>
        </div>
      </div>
    </>
  );
}
