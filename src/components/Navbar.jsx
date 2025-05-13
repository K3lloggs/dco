// src/components/Navbar.jsx - Simple Black & White
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <header className="main-header">
      <div className="container">
        <div className="navbar">
          <Link to="/" className="brand-logo">
            David & Co
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;