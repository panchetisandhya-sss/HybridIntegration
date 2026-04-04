import { Link, useLocation } from "react-router-dom";
import "../styles.css";

export default function Navbar() {
  const { pathname } = useLocation();

  const links = [
    { name: "Use Case", path: "/" },
    { name: "Simulation", path: "/simulation" },
    { name: "About", path: "/about" },
    { name: "History", path: "/history" },
  ];

  return (
    <header className="top-navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          Q-SecureVote
        </Link>

        <nav className="navbar-links">
          {links.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              className={`nav-link ${
                pathname === l.path ? "active" : ""
              }`}
            >
              {l.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

