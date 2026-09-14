import { NavLink } from 'react-router-dom'

const logoUrl = new URL('../../../../docs/octofitapp-small.png', import.meta.url).href

function Navigation() {
  const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/activities', label: 'Activities' },
    { to: '/leaderboard', label: 'Leaderboard' },
    { to: '/teams', label: 'Teams' },
  ]

  return (
    <header className="app-header">
      <nav className="navbar navbar-expand-lg" aria-label="OctoFit navigation">
        <div className="container-fluid px-0">
          <NavLink className="brand-link" to="/">
            <img src={logoUrl} alt="OctoFit Tracker" className="brand-logo" />
            <span>OctoFit Tracker</span>
          </NavLink>
          <div className="nav-links">
            {links.map((link) => (
              <NavLink
                className={({ isActive }) => `nav-pill${isActive ? ' active' : ''}`}
                key={link.to}
                to={link.to}
                end={link.to === '/'}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Navigation