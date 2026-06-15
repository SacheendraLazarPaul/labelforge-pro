import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Layout() {
  const { logout, user } = useAuth();
  const location = useLocation();

  const navItems = [
    { to: '/', label: 'Dashboard' },
    { to: '/projects/new', label: 'New Project' },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <h1>LabelForge Pro</h1>
          <p className="sidebar-subtitle">AI data labeling platform</p>
        </div>
        <nav>
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} className={location.pathname === item.to ? 'nav-link active' : 'nav-link'}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="user-card">
          <strong>{user?.full_name}</strong>
          <span>{user?.email}</span>
          <button className="secondary-button" onClick={logout}>Logout</button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
