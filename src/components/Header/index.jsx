import React, { useEffect, useState } from 'react';
import "./header.css";
import { NavLink } from "react-router-dom";

const Header = () => {
  const [name, setName] = useState('');

  useEffect(() => {
    // Récupérer le nom du localStorage lors du premier rendu du composant
    const storedName = localStorage.getItem('name');
    if (storedName) {
      setName(storedName);
    }
  }, []);

  return (
    <div className="header-content">
      <div className="header-left">
        {/* <div className="input-button">
          <img src="image/logo-find.png" alt="" />
          <input type="text" className="search" name="search" placeholder="Search..." />
        </div> */}
      </div>
      <div className="header-right">
        
        <div className="profile">
          <img src="image/logo-avatar.png" alt="" />
          <NavLink to="/edit_user" className={({ isActive }) => isActive ? "active" : ""}>
            <span className="profile-name">{name || 'John D.'}</span>
          </NavLink>
        </div>
      </div>

    </div>
  );
}

export default Header;
