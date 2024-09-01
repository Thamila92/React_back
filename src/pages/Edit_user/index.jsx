import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Assurez-vous d'importer axios
import './edit_user.css'; // Assurez-vous que le chemin est correct

const UserProfile = () => {
  const [userData, setUserData] = useState({
    name: '',
    adresse: '',
    dateDeNaissance: '',
    email: '',
    password: '',
    actual_password: '',
    new_password: ''
  });
  const [initialUserData, setInitialUserData] = useState(null);
  const [isEditingEmailPassword, setIsEditingEmailPassword] = useState(false);

  const VITE_URL_API = import.meta.env.VITE_URL_API; // Assurez-vous que cette variable d'environnement est correctement configurée

  // Fonction pour récupérer les détails de l'utilisateur
  const fetchUserDetails = async () => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    try {
      const response = await axios.get(`${VITE_URL_API}/getUser/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 200) {
        const user = response.data;
        const formattedUser = {
          name: user.name || '',
          adresse: user.adresse || '',
          dateDeNaissance: user.dateDeNaissance ? new Date(user.dateDeNaissance).toISOString().split('T')[0] : '',
          email: user.email || '',
          password: '', // Ne stockez pas de mot de passe reçu du serveur
          actual_password: '',
          new_password: ''
        };
        setUserData(formattedUser);
        setInitialUserData(formattedUser); // Stocke les données initiales pour comparaison ultérieure
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de l utilisateur', error);
    }
  };

  // Utilisez useEffect pour charger les données utilisateur une fois au montage du composant
  useEffect(() => {
    fetchUserDetails();
  }, []);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleEditEmailPassword = () => {
    setIsEditingEmailPassword(true);
    setUserData({ ...userData, actual_password: '', new_password: '' });
  };
  const handlePasswordChange = async () => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
  
    try {
      const response = await axios.patch(`${VITE_URL_API}/UpdatePwd/${userId}`, {
        oldPassword: userData.actual_password,
        newPassword: userData.new_password
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (response.status === 200) {
        console.log('Mot de passe mis à jour avec succès');
        // Vous pouvez ici réinitialiser les champs de mot de passe ou informer l'utilisateur du succès
        setIsEditingEmailPassword(false);
        setUserData({ ...userData, actual_password: '', new_password: '' });
      } else {
        console.error('Erreur lors du changement de mot de passe');
      }
    } catch (error) {
      console.error('Erreur lors de la tentative de changement de mot de passe', error);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    
    let updates = {};
    for (let key in userData) {
      if (userData[key] !== initialUserData[key]) {
        updates[key] = userData[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      console.log('Aucune modification à sauvegarder');
      return;
    }

    try {
      const response = await axios.patch(`${VITE_URL_API}/updateUser/${userId}`, updates, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.status === 200) {
        console.log('Données mises à jour avec succès:', response.data);
        setInitialUserData(userData); // Mise à jour de l'état initial après une mise à jour réussie
      } else {
        console.error('Une erreur est survenue lors de la mise à jour des données');
      }
    } catch (error) {
      console.error('Erreur lors de la tentative de mise à jour des données utilisateur', error);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-sidebar">
        <img src="https://via.placeholder.com/150" alt="Avatar" className="profile-avatar" />
        <h2>{userData.name}</h2>
        <p>{userData.email}</p>
      </div>
      <div className="profile-content">
        <h1>Paramètre de profil</h1>
        <div className="profile-form">
          <div className="profile-section">
            <label>Nom Prénom</label>
            <input type="text" name="name" value={userData.name} onChange={handleChange} />
            <label>Adresse</label>
            <input type="text" name="adresse" value={userData.adresse} onChange={handleChange} />
            <label>Date de naissance</label>
            <input type="date" name="dateDeNaissance" value={userData.dateDeNaissance} onChange={handleChange} />
          </div>
          <div className="profile-section">
            <h2>Paramètre Confidentialité</h2>
            {isEditingEmailPassword ? (
              <>
             <label>Email</label>
              <input type="email" name="email" value={userData.email} onChange={handleChange} />
              <label>Ancien Mot de passe</label>
              <input type="password" name="actual_password" value={userData.actual_password} onChange={handleChange} />
              <label>Nouveau Mot de passe</label>
              <input type="password" name="new_password" value={userData.new_password} onChange={handleChange} />
              <button onClick={handlePasswordChange}>Changer le mot de passe</button>
            </>
          
            ) : (
              <>
                <label>Email</label>
                <input type="email" name="email" value={userData.email} disabled />
                <label>Mot de passe</label>
                <input type="password" name="password" value={userData.password} disabled />
                <button className="manage-btn" onClick={handleEditEmailPassword}>Gérer</button>
              </>
            )}
          </div>
        </div>
        <button onClick={handleSubmit} className="save-btn">Sauvegarder</button>
      </div>
    </div>
  );
};

export default UserProfile;
