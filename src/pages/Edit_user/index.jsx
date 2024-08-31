import React, { useState, useEffect } from 'react';
import './edit_user.css';

const Profile = () => {
    const [userData, setUserData] = useState({
        name: '',
        adresse: '',
        dateDeNaissance: '',
        email: '',
        password: '',
        actual_password: '',
        new_password: ''
    });

    useEffect(() => {
        // Récupère les données utilisateur depuis le localStorage
        const storedUser = {
            name: localStorage.getItem('name') || '',
            adresse: localStorage.getItem('adresse') || '',
            dateDeNaissance: localStorage.getItem('dateDeNaissance') || '',
            email: localStorage.getItem('email') || '',
        };

        setUserData((prevData) => ({
            ...prevData,
            ...storedUser
        }));
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData({ ...userData, [name]: value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const dataToUpdate = {};

        if (userData.name) dataToUpdate.name = userData.name;
        if (userData.adresse) dataToUpdate.adresse = userData.adresse;
        if (userData.dateDeNaissance) dataToUpdate.dateDeNaissance = userData.dateDeNaissance;

        // Si l'utilisateur modifie son mot de passe, on ajoute les champs nécessaires
        if (userData.actual_password && userData.new_password) {
            dataToUpdate.actual_password = userData.actual_password;
            dataToUpdate.password = userData.new_password;
        }

        try {
            const userId = localStorage.getItem('id');
            const VITE_URL_API = import.meta.env.VITE_URL_API;

            const response = await fetch(`${VITE_URL_API}/updateUser/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(dataToUpdate),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la sauvegarde des informations');
            }

            const updatedUser = await response.json();
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            // Message de succès personnalisé
            alert(`Bravo ${userData.name || 'utilisateur'}, vos informations ont été mises à jour avec succès !`);
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la sauvegarde des informations.');
        }
    };

    const handleDebanir = async () => {
        try {
            const userId = localStorage.getItem('id');
            const VITE_URL_API = import.meta.env.VITE_URL_API;

            const response = await fetch(`${VITE_URL_API}/debanir/${userId}`, {
                method: 'PATCH', // Ou utilisez 'POST' ou 'DELETE' selon l'API
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la tentative de débanissement.');
            }

            alert(`L'utilisateur ${userData.name} a été débanni avec succès.`);
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la tentative de débanissement.');
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-sidebar">
                <img
                    src="https://via.placeholder.com/150"
                    alt="Avatar"
                    className="profile-avatar"
                />
                <h2>{userData.name}</h2>
                <p>{userData.email}</p>
            </div>
            <div className="profile-content">
                <h1>Paramètres de profil</h1>
                <div className="profile-form">
                    <div className="profile-section">
                        <label>Nom Prénom</label>
                        <input
                            type="text"
                            name="name"
                            value={userData.name}
                            onChange={handleInputChange}
                        />
                        <label>Adresse</label>
                        <input
                            type="text"
                            name="adresse"
                            value={userData.adresse}
                            onChange={handleInputChange}
                        />
                        <label>Date de naissance</label>
                        <input
                            type="date"
                            name="dateDeNaissance"
                            value={userData.dateDeNaissance}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="profile-section">
                        <h2>Paramètres de Confidentialité</h2>
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={userData.email}
                            disabled
                        />
                        <label>Mot de passe</label>
                        <input
                            type="password"
                            name="password"
                            value={userData.password}
                            disabled
                        />
                        <button className="manage-btn" onClick={() => setUserData({ ...userData, actual_password: '', new_password: '' })}>
                            Gérer
                        </button>
                    </div>
                </div>
                <button onClick={handleSave} className="save-btn">Sauvegarder</button>
                <button onClick={handleDebanir} className="debanir-btn">Débanir</button> {/* Bouton pour débanir */}
            </div>
        </div>
    );
};

export default Profile;
