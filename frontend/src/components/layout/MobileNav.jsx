import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Flame } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/sessions', icon: Users, label: 'Sessions' },
  { to: '/heatmap', icon: Flame, label: 'Heatmap' },
];

export default function MobileNav() {
  return (
    <nav className="mobile-nav" role="navigation" aria-label="Mobile navigation">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}
          aria-label={label}
        >
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
