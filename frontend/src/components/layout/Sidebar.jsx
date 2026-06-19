import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Flame,
  Activity,
  Zap,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/sessions', icon: Users, label: 'Sessions' },
  { to: '/heatmap', icon: Flame, label: 'Heatmap' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <NavLink to="/dashboard" className="sidebar-logo">
        <div className="logo-icon">
          <Zap size={18} color="white" strokeWidth={2.5} />
        </div>
        <div className="logo-text">
          <span className="brand">CF Analytics</span>
          <span className="sub">CausalFunnel</span>
        </div>
      </NavLink>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Platform</div>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            title={label}
          >
            <Icon size={18} className="nav-icon" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="live-indicator">
          <div className="live-dot" />
          <span className="live-text">Live Tracking</span>
        </div>
        <div className="user-avatar">
          <div className="avatar-circle">
            <Activity size={14} color="white" />
          </div>
          <div className="avatar-info">
            <div className="name">Admin User</div>
            <div className="role">Analytics Engineer</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
