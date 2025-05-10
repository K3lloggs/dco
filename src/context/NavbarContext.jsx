// src/context/NavbarContext.jsx
import { useState, useEffect, createContext, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';

// Create context
const NavbarContext = createContext();

// Custom hook to use the navbar context
export const useNavbar = () => useContext(NavbarContext);

// Navbar provider component
export const NavbarProvider = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [jewelryDropdownOpen, setJewelryDropdownOpen] = useState(false);
  const location = useLocation();
  
  // Close menus when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setJewelryDropdownOpen(false);
  }, [location]);

  // Handle scroll effect for the fixed header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Close the jewelry dropdown when toggling the main menu
    setJewelryDropdownOpen(false);
  };

  // Toggle jewelry dropdown
  const toggleJewelryDropdown = (e) => {
    e.preventDefault(); // Prevent navigating away
    setJewelryDropdownOpen(!jewelryDropdownOpen);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.navbar-container') && 
          !event.target.closest('.menu-toggle')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Provide the context value
  const contextValue = {
    isMenuOpen,
    setIsMenuOpen,
    isScrolled,
    jewelryDropdownOpen,
    setJewelryDropdownOpen,
    toggleMenu,
    toggleJewelryDropdown
  };

  return (
    <NavbarContext.Provider value={contextValue}>
      {children}
    </NavbarContext.Provider>
  );
};

// The actual Navbar component
const Navbar = () => {
  const { 
    isMenuOpen, 
    isScrolled, 
    jewelryDropdownOpen, 
    toggleMenu,
    toggleJewelryDropdown 
  } = useNavbar();

  return (
    <>
      {/* Single header with contact info and brand name */}
      <header className={`fixed top-0 left-0 right-0 z-40 bg-white transition-all ${isScrolled ? 'shadow-subtle' : ''}`}>
        <div className="container mx-auto px-4">
          {/* Contact info bar */}
          <div className="text-center py-2 info-bar hidden md:block">
            <div className="flex justify-center items-center space-x-6">
              <a href="tel:213-632-9061">213-632-9061</a>
              <span>|</span>
              <a href="mailto:HELLO@DAVID&CO.COM">HELLO@DAVID&CO.COM</a>
              <span>|</span>
              <a href="https://wa.me/12136329061">WHATSAPP</a>
            </div>
          </div>
          
          {/* Main navigation */}
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div>
              <Link to="/" className="brand-logo">
                David & Co
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:block">
              <ul className="flex space-x-6">
                <li>
                  <Link to="/new">New</Link>
                </li>
                <li className="relative">
                  <button 
                    onClick={toggleJewelryDropdown}
                    className="nav-link flex items-center"
                  >
                    Jewelry
                    <svg 
                      className={`ml-1 h-3 w-3 transition-transform ${jewelryDropdownOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Dropdown menu */}
                  <div 
                    className={`absolute left-0 mt-1 bg-white shadow-subtle transition-all z-50 ${
                      jewelryDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                    }`}
                    style={{ minWidth: '160px' }}
                  >
                    <Link to="/bracelet" className="block px-4 py-2 hover:bg-gray-50">Bracelet</Link>
                    <Link to="/brooch" className="block px-4 py-2 hover:bg-gray-50">Brooch</Link>
                    <Link to="/earring" className="block px-4 py-2 hover:bg-gray-50">Earring</Link>
                    <Link to="/necklace" className="block px-4 py-2 hover:bg-gray-50">Necklace</Link>
                    <Link to="/pendant" className="block px-4 py-2 hover:bg-gray-50">Pendant</Link>
                    <Link to="/pin" className="block px-4 py-2 hover:bg-gray-50">Pin</Link>
                    <Link to="/ring" className="block px-4 py-2 hover:bg-gray-50">Ring</Link>
                  </div>
                </li>
                <li>
                  <Link to="/watches">Watches</Link>
                </li>
                <li>
                  <Link to="/objets-d-art">Objets d'Art</Link>
                </li>
              </ul>
            </nav>

            {/* Mobile menu button */}
            <button 
              className="md:hidden menu-toggle" 
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <svg 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1} 
                  d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Sidebar */}
      <div 
        className={`mobile-nav ${isMenuOpen ? 'open' : ''}`}
      >
        <div className="navbar-container relative h-full overflow-y-auto p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <span className="brand-logo">David & Co</span>
            <button 
              onClick={toggleMenu}
              aria-label="Close menu"
            >
              <svg 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          </div>
          
          {/* Navigation Links */}
          <nav>
            <ul className="space-y-6">
              <li>
                <Link 
                  to="/new" 
                  className="block text-lg"
                  onClick={toggleMenu}
                >
                  New
                </Link>
              </li>
              
              {/* Mobile Jewelry dropdown */}
              <li>
                <button 
                  onClick={toggleJewelryDropdown}
                  className="flex justify-between items-center w-full text-lg"
                >
                  Jewelry
                  <svg 
                    className={`h-4 w-4 transition-transform ${jewelryDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Mobile Jewelry submenu */}
                <div className={`mt-4 ml-4 space-y-3 ${jewelryDropdownOpen ? 'block' : 'hidden'}`}>
                  <Link to="/bracelet" className="block" onClick={toggleMenu}>Bracelet</Link>
                  <Link to="/brooch" className="block" onClick={toggleMenu}>Brooch</Link>
                  <Link to="/earring" className="block" onClick={toggleMenu}>Earring</Link>
                  <Link to="/necklace" className="block" onClick={toggleMenu}>Necklace</Link>
                  <Link to="/pendant" className="block" onClick={toggleMenu}>Pendant</Link>
                  <Link to="/pin" className="block" onClick={toggleMenu}>Pin</Link>
                  <Link to="/ring" className="block" onClick={toggleMenu}>Ring</Link>
                </div>
              </li>
              
              <li>
                <Link 
                  to="/watches" 
                  className="block text-lg"
                  onClick={toggleMenu}
                >
                  Watches
                </Link>
              </li>
              
              <li>
                <Link 
                  to="/objets-d-art" 
                  className="block text-lg"
                  onClick={toggleMenu}
                >
                  Objets d'Art
                </Link>
              </li>
            </ul>
          </nav>
          
          {/* Contact Info */}
          <div className="mt-10 info-bar">
            <div className="space-y-3">
              <a href="tel:213-632-9061" className="block">213-632-9061</a>
              <a href="mailto:HELLO@DAVID&CO.COM" className="block">HELLO@DAVID&CO.COM</a>
              <a href="https://wa.me/12136329061" className="block">WHATSAPP</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;