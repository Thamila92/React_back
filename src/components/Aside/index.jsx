import { NavLink, useNavigate } from "react-router-dom";
import "./aside.css";

const Aside = () => {
  const status = localStorage.getItem('status');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('status');
    localStorage.removeItem('name');
    localStorage.removeItem('token');
    navigate("/"); // Redirige l'utilisateur vers la page d'accueil après la déconnexion
  };

  return (
    <div className="aside">
      <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>
        <div className="aside-logo"><img src="image/logo.png" alt="logo" /></div>
      </NavLink>

      <NavLink to="/document" className={({ isActive }) => isActive ? "active" : ""}>
        <div className="aside-center"><img src="image/logo-doc.png" alt="doc" /></div>
      </NavLink>

      <NavLink to="/mycalendar" className={({ isActive }) => isActive ? "active" : ""}>
        <div className="aside-center"><img src="image/logo-calendar.png" alt="calendar" /></div>
      </NavLink>

      <NavLink to="/vote" className={({ isActive }) => isActive ? "active" : ""}>
        <div className="aside-center"><img src="https://cdn-icons-png.flaticon.com/128/3179/3179218.png" alt="vote" /></div>
      </NavLink>

      {status === 'ADMIN' && (
        <NavLink to="/expenditure" className={({ isActive }) => isActive ? "active" : ""}>
          <div className="aside-center"><img src="image/logo-resources.png" alt="resources" /></div>
        </NavLink>
        
      )}

      {status === 'BENEFACTOR' && (
        <NavLink to="/donation" className={({ isActive }) => isActive ? "active" : ""}>
          <div className="aside-center"><img src="image/logo-resources.png" alt="resources" /></div>
        </NavLink>
      )}

      <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""} onClick={handleLogout}>
        <div className="aside-logout"><img src="image/logo-exit.png" alt="logout" /></div>
      </NavLink>
    </div>
  );
};

export default Aside;