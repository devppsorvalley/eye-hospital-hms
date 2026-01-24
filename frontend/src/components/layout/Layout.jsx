import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { authStore } from '../../store/auth.store';
import logo from '../../assets/seemant_logo.jpeg';
import '../../styles/layout.css';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const user = authStore.getUser();
  const [showMastersMenu, setShowMastersMenu] = useState(false);

  const handleLogout = async () => {
    authStore.clearAuth();
    navigate('/login');
  };

  // Role-based navigation links
  const getNavLinks = () => {
    const role = user?.role;
    const links = [
      { path: '/dashboard', label: 'Dashboard', roles: ['ADMIN', 'DOCTOR', 'OPERATOR'] },
      { path: '/registration', label: 'Registration', roles: ['ADMIN', 'OPERATOR'] },
      { path: '/opd', label: 'OPD', roles: ['ADMIN', 'OPERATOR'] },
      { path: '/consultation', label: 'Consultation', roles: ['DOCTOR'] },
      { path: '/billing', label: 'Billing', roles: ['ADMIN', 'OPERATOR'] },
      { 
        path: '/masters', 
        label: 'Masters', 
        roles: ['ADMIN'],
        dropdown: [
          { path: '/masters/service-charges', label: 'Service Charges' },
          { path: '/masters/users', label: 'User Management' },
        ]
      },
    ];

    return links.filter(link => link.roles.includes(role));
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <img src={logo} alt="Seemant Foundation" className="logo" />
            <span className="hospital-name">Seemant Eye Hospital — HMS</span>
          </div>
          <nav className="header-nav">
            {getNavLinks().map(link => (
              link.dropdown ? (
                <div 
                  key={link.path} 
                  className="nav-dropdown"
                  onMouseEnter={() => setShowMastersMenu(true)}
                  onMouseLeave={() => setShowMastersMenu(false)}
                >
                  <span className="nav-link">{link.label}</span>
                  {showMastersMenu && (
                    <div className="dropdown-menu">
                      {link.dropdown.map(item => (
                        <Link 
                          key={item.path} 
                          to={item.path} 
                          className="dropdown-item"
                          onClick={() => setShowMastersMenu(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link key={link.path} to={link.path} className="nav-link">
                  {link.label}
                </Link>
              )
            ))}
          </nav>
          <div className="header-user">
            <span>{user?.username}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <main className="main">
        {children}
      </main>
    </div>
  );
}
