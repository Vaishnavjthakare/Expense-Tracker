import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { HiOutlineHome, HiOutlinePlusCircle, HiOutlineClipboardList, HiOutlineChartPie, HiOutlineDocumentReport, HiOutlineLogout } from 'react-icons/hi';

const links = [
  { to: '/', icon: HiOutlineHome, label: 'Dashboard' },
  { to: '/add', icon: HiOutlinePlusCircle, label: 'Add Transaction' },
  { to: '/transactions', icon: HiOutlineClipboardList, label: 'Transactions' },
  { to: '/reports', icon: HiOutlineDocumentReport, label: 'Reports' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">E</div>
        <h1>ExpenseTracker</h1>
      </div>

      <nav className="sidebar-nav">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Icon /> {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
        <div className="user-info">
          <p>{user?.name}</p>
          <span>{user?.email}</span>
        </div>
        <button className="logout-btn" onClick={logout} title="Logout">
          <HiOutlineLogout />
        </button>
      </div>
    </aside>
  );
}
