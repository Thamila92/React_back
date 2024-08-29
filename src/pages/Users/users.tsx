import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./users.css";

// Définir une interface pour les utilisateurs
interface User {
  id: number;
  name: string;
  email: string;
  dateDeNaissance?: string; // dateDeNaissance peut être null ou non défini
  isBanned: boolean;
}

const Users = () => {
  // Déclarer l'état avec le type User[]
  const [users, setUsers] = useState<User[]>([]);
  const VITE_URL_API = "http://localhost:3000";

  useEffect(() => {
    // Appel à l'API pour récupérer tous les utilisateurs
    axios.get(`${VITE_URL_API}/listUsers`)
      .then((response) => {
        setUsers(response.data.users); // Mettre à jour l'état avec les utilisateurs récupérés
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        toast.error("Erreur lors du chargement des utilisateurs.");
      });
  }, [VITE_URL_API]);

  const handleBanUser = (userId: number) => {
    // Appel à l'API pour bannir l'utilisateur
    axios.post(`${VITE_URL_API}/banUser/${userId}`)
      .then((response) => {
        toast.success(response.data.message);
        // Mettre à jour l'état local pour refléter le bannissement
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, isBanned: !user.isBanned } : user
          )
        );
      })
      .catch((error) => {
        console.error("Error banning user:", error);
        toast.error("Erreur lors du bannissement de l'utilisateur.");
      });
  };

  return (
    <div className="users-container">
      <h1>Liste des utilisateurs</h1>
      <table className="users-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Date de naissance</th>
            <th>Banni</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.dateDeNaissance ? new Date(user.dateDeNaissance).toLocaleDateString() : "N/A"}</td>
              <td>{user.isBanned ? "Oui" : "Non"}</td>
              <td>
                <button className="ban-button" onClick={() => handleBanUser(user.id)}>
                  <i className="fas fa-trash"></i> {user.isBanned ? "Débannir" : "Bannir"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
