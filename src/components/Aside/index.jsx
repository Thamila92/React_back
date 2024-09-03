import { NavLink, useNavigate } from "react-router-dom";
import "./aside.css";

const Aside = () => {
  const statusType = localStorage.getItem('statusType');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();  
    navigate("/"); 
  };

  return (
    <div className="aside">
           {statusType === 'ADMIN' ? (
 
        <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>
        <div className="aside-logo"><img src="image/logo.png" alt="logo" /></div>
      </NavLink>

      
      ) : (

        <NavLink to="/missions" className={({ isActive }) => isActive ? "active" : ""}>
        <div className="aside-logo"><img src="image/logo.png" alt="logo" /></div>
        </NavLink>
 

      )}
 

      <NavLink to="/folder" className={({ isActive }) => isActive ? "active" : ""}>
        <div className="aside-center"><img src="image/logo-doc.png" alt="doc" /></div>
      </NavLink>

      <NavLink to="/mycalendar" className={({ isActive }) => isActive ? "active" : ""}>
        <div className="aside-center"><img src="image/logo-calendar.png" alt="calendar" /></div>
      </NavLink>

      {/* Affiche uniquement si l'utilisateur est ADMIN */}
      {statusType === 'ADMIN' ? (
        <>
          <NavLink to="/admin_vote" className={({ isActive }) => isActive ? "active" : ""}>
            <div className="aside-center"><img src="https://cdn-icons-png.flaticon.com/128/3179/3179218.png" alt="vote" /></div>
          </NavLink>
          <NavLink to="/demandes" className={({ isActive }) => isActive ? "active" : ""}>
            <div className="aside-center"><img src="image/logo-demande.png" alt="demandes" /></div>
          </NavLink>
          <NavLink to="/users" className={({ isActive }) => isActive ? "active" : ""}>
            <div className="aside-center"><img src="image/logo-users.png" alt="users" /></div>
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
            <div className="aside-center"><img src="image/logo-resources.png" alt="dashboard" /></div>
          </NavLink>

          
        </>
      ) : (

        <>
        <NavLink to="/vote" className={({ isActive }) => isActive ? "active" : ""}>
          <div className="aside-center"><img src="https://cdn-icons-png.flaticon.com/128/3179/3179218.png" alt="vote" /></div>
        </NavLink>

 </>

      )}
    
 <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""} onClick={handleLogout}>
        <div className="aside-logout"><img src="image/logo-exit.png" alt="logout" /></div>
      </NavLink>
    </div>
  );
};

export default Aside;
