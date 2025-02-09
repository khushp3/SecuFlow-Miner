// src/components/Header.js
import { useState, useEffect, useRef } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { Spin as Hamburger } from 'hamburger-react';
import { Link } from 'react-router-dom';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const menuRef = useRef();
  const hamburgerRef = useRef();

  const links = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      subtitles: [
        { title: 'Placeholder', url: '/placeholder' },
        { title: 'Placeholder', url: '/placeholder' },
      ],
    },
    {
      title: 'Projects',
      url: '/projects',
      subtitles: [],
    },
    {
      title: 'Settings',
      url: '/settings',
      subtitles: [
        { title: 'Placeholder', url: '/placeholder' },
        { title: 'Placeholder', url: '/placeholder' },
      ],
    },
  ];

  const handleMouseEnter = (index) => {
    setOpenDropdown(index);
  };

  const handleMouseLeave = () => {
    setOpenDropdown(null);
  };

  const handleLinkClick = () => {
    setIsOpen(false);
    setOpenDropdown(null);
  };

  const handleClickOutside = (event) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target) &&
      hamburgerRef.current &&
      !hamburgerRef.current.contains(event.target)
    ) {
      setIsOpen(false);
      setOpenDropdown(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  return (
    <header className="bg-white shadow-lg fixed w-full z-10">
      <div className="max-w-[105rem] mx-auto px-4 sm:px-6 lg:px-8 xl:py-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center select-none" onClick={handleLinkClick}>
            {/* <img src="/sp-logo.png" alt="SecuFlow" className="h-10 w-10 mr-2" /> */}
            <span className="text-xl font-semibold">SecuFlow</span>
          </Link>
          <div className="hidden xl:flex space-x-20">
            {links.map((item, index) => (
              <div
                key={index}
                className="relative group"
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  to={item.url || '#'}
                  className="flex items-center text-gray-700 hover:text-gray-900"
                >
                  {item.title}
                  {item.subtitles.length > 0 && (
                    <FaChevronDown
                      className={`ml-1 text-sm transition-transform duration-200 text-gray-700 group-hover:transform group-hover:rotate-180 ${
                        openDropdown === index ? 'transform rotate-180 text-gray-700' : ''
                      }`}
                    />
                  )}
                </Link>
                {item.subtitles.length > 0 && (
                  <div
                    className={`absolute top-full left-0 mt-2 bg-white shadow-lg rounded-md w-48 border border-blue-100 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 ${
                      openDropdown === index ? 'visible opacity-100' : ''
                    }`}
                  >
                    {item.subtitles.map((subtitle, subIndex) => (
                      <Link
                        key={subIndex}
                        to={subtitle.url || '#'}
                        className="block px-6 py-4 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {subtitle.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="hidden xl:block">
            <Link
              to="/profile"
              className="bg-blue-600 text-white px-6 py-3 rounded-3xl hover:bg-blue-700 font-bold transition-all"
            >
              Profile
            </Link>
          </div>
          <div className="xl:hidden" ref={hamburgerRef}>
            <Hamburger size={20} duration={0.8} toggled={isOpen} toggle={setIsOpen} />
          </div>
        </div>
      </div>

      {isOpen && (
        <div ref={menuRef} className="xl:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {links.map((item, index) => (
              <div key={index} className="relative">
                <div className="flex justify-between items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100">
                  <Link to={item.url || '#'} className="flex items-center" onClick={handleLinkClick}>
                    {item.title}
                  </Link>
                  {item.subtitles.length > 0 && (
                    <FaChevronDown
                      className={`text-sm ml-1 transition-transform duration-200 ${
                        openDropdown === index ? 'transform rotate-180 text-gray-700' : ''
                      }`}
                      onClick={() => setOpenDropdown(index === openDropdown ? null : index)}
                    />
                  )}
                </div>
                {openDropdown === index && item.subtitles.length > 0 && (
                  <div className="bg-white shadow-lg rounded-md">
                    {item.subtitles.map((subtitle, subIndex) => (
                      <Link
                        key={subIndex}
                        to={subtitle.url || '#'}
                        className="block px-6 py-4 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={handleLinkClick}
                      >
                        {subtitle.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Profile
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
