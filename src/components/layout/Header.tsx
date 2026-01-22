// Header Component - App Layout
// TODO: Implement navigation và user menu
import { Link } from 'react-router-dom'

export function Header() {
  return (
    <header className="header">
      <Link to="/">Logo</Link>
      <nav>{/* Navigation links */}</nav>
      <div>{/* Cart, User menu */}</div>
    </header>
  )
}
