import { NavLink } from 'react-router-dom'

export function Sidebar() {
    const navItems = [
        { name: 'Dashboard', path: '/' },
        { name: 'Projects', path: '/projects' },
        { name: 'Tasks', path: '/tasks' },
        { name: 'Users', path: '/users' },
    ]

    return (
        <aside className="sidebar" style={{ width: '250px', borderRight: '1px solid #eee', padding: '1rem' }}>
            <nav>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {navItems.map((item) => (
                        <li key={item.path} style={{ marginBottom: '0.5rem' }}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    isActive ? 'active-link' : 'inactive-link'
                                }
                                style={({ isActive }) => ({
                                    display: 'block',
                                    padding: '0.5rem 1rem',
                                    textDecoration: 'none',
                                    color: isActive ? 'blue' : 'black',
                                    backgroundColor: isActive ? '#f0f0f0' : 'transparent',
                                    borderRadius: '4px',
                                })}
                            >
                                {item.name}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    )
}
