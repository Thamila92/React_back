import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./users.css";

// Définir une interface pour les utilisateurs
interface User {
  id: number;
  name: string;
  email: string;
  dateDeNaissance?: string; // Peut être null ou non défini
  adresse?: string;
  isBanned: boolean;
  status: {
    id: number;
    type: string;
  };
  // Propriétés non modifiables directement
  createdAt?: string;
  isAvailable?: boolean;
  isDeleted?: boolean;
  skills?: any[]; // Ou un autre type si vous avez une définition précise
}


const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [statuses, setStatuses] = useState<{ id: number; type: string }[]>([]); // Pour stocker les types de statuts disponibles
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null); // Pour l'utilisateur en cours d'édition
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    adresse: "",
    dateDeNaissance: "",
    role: "adherent",
  });

  const VITE_URL_API = import.meta.env.VITE_URL_API;

  useEffect(() => {
    axios
      .get(`${VITE_URL_API}/listUsers`)
      .then((response) => {
        setUsers(response.data.users);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        toast.error("Erreur lors du chargement des utilisateurs.");
      });

    axios
      .get(`${VITE_URL_API}/statuses`) // Endpoint pour obtenir tous les statuts
      .then((response) => {
        setStatuses(response.data);
      })
      .catch((error) => {
        console.error("Error fetching statuses:", error);
        toast.error("Erreur lors du chargement des statuts.");
      });
  }, [VITE_URL_API]);

  const handleBanUser = (userId: number) => {
    axios
      .post(`${VITE_URL_API}/banUser/${userId}`)
      .then((response) => {
        toast.success(response.data.message);
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

  const handleDeleteUser = (userId: number) => {
    axios
      .delete(`${VITE_URL_API}/deleteUser/${userId}`)
      .then((response) => {
        toast.success("Utilisateur supprimé avec succès");
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      })
      .catch((error) => {
        console.error("Error deleting user:", error);
        toast.error("Erreur lors de la suppression de l'utilisateur.");
      });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (editUser) {
      setEditUser({ ...editUser, [name]: value });
    } else {
      setNewUser({ ...newUser, [name]: value });
    }
  };

  const handleAddUser = () => {
    const endpoint =
      newUser.role === "admin"
        ? "/admin/signup"
        : newUser.role === "salarier"
        ? "/salarier/signup"
        : "/adherent/signup";

    const { role, ...userToSend } = newUser;

    axios
      .post(`${VITE_URL_API}${endpoint}`, userToSend)
      .then((response) => {
        toast.success("Utilisateur ajouté avec succès");
        setUsers([...users, response.data.user]);
        setShowModal(false);
      })
      .catch((error) => {
        console.error("Error adding user:", error);
        toast.error("Erreur lors de l'ajout de l'utilisateur.");
      });
  };

  const handleDoubleClick = (user: User) => {
    setEditUser(user); // Mettre l'utilisateur en mode édition
    setShowModal(true); // Afficher le modal d'édition
  };
  const handleUpdateUser = () => {
    if (editUser) {
        const { id, status, createdAt, isAvailable, isBanned, isDeleted, skills, ...userToUpdate } = editUser;

        // Conservez une référence à l'utilisateur original
        const originalUser = users.find(user => user.id === id);

        // Tracer l'utilisateur avant la modification
        console.log("Original User:", originalUser);

        // Filtrer les champs non modifiables et les retirer de userToUpdate
        const updatedFields: Partial<User> & { statusId?: number } = {};

        // Comparer les champs et ne prendre que les champs modifiés
        for (const key in userToUpdate) {
            if (originalUser && userToUpdate[key] !== originalUser[key as keyof User]) {
                console.log(`Field changed: ${key} - Old: ${originalUser[key as keyof User]}, New: ${userToUpdate[key]}`);
                updatedFields[key as keyof User] = userToUpdate[key];
            }
        }

        // Vérifiez si le statut a changé
        if (status && originalUser && status.id !== originalUser.status.id) {
            console.log(`Status changed: Old: ${originalUser.status.id}, New: ${status.id}`);
            updatedFields.statusId = status.id;
        }

        if (Object.keys(updatedFields).length === 0) {
            toast.info("No changes made.");
            return;
        }

        axios
            .patch(`${VITE_URL_API}/updateUser/${id}`, updatedFields)
            .then((response) => {
                toast.success("Utilisateur mis à jour avec succès");
                setUsers((prevUsers) =>
                    prevUsers.map((user) =>
                        user.id === id ? response.data : user
                    )
                );
                setShowModal(false);
                setEditUser(null); // Réinitialiser l'utilisateur en mode édition
            })
            .catch((error) => {
                console.error("Error updating user:", error);
                toast.error("Erreur lors de la mise à jour de l'utilisateur.");
            });
    }
};


return (
  <div className="users-container">
    <h1>Liste des utilisateurs</h1>
    <button className="add-user-button" onClick={() => setShowModal(true)}>
      + Ajouter un utilisateur
    </button>
    <table className="users-table">
      <thead>
        <tr>
          <th>Nom</th>
          <th>Email</th>
          <th>Date de naissance</th>
          <th>Statut</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id} onDoubleClick={() => handleDoubleClick(user)}>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>
              {user.dateDeNaissance
                ? new Date(user.dateDeNaissance).toLocaleDateString()
                : "N/A"}
            </td>
            <td>{user.status?.type || "N/A"}</td>
            <td>
              <button className="ban-button" onClick={() => handleBanUser(user.id)}>
                {user.isBanned ? "Débannir" : "Bannir"}
              </button>
              <button className="delete-button" onClick={() => handleDeleteUser(user.id)}>
                🗑️
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    {showModal && (
      <div className="modal">
        <div className="modal-content">
          <h2>{editUser ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}</h2>
          <label>
            Nom:
            <input
              type="text"
              name="name"
              value={editUser ? editUser.name : newUser.name}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={editUser ? editUser.email : newUser.email}
              onChange={handleInputChange}
              required
            />
          </label>
          {editUser && (
            <>
              <label>
              Statut:
              <select 
                  name="status" 
                  value={editUser?.status?.id} 
                  onChange={(e) => {
                      const selectedStatus = statuses.find(s => s.id === Number(e.target.value));
                      if (selectedStatus) {
                          setEditUser({ ...editUser, status: selectedStatus });
                      }
                  }}
              >
                  {statuses.map((status) => (
                      <option key={status.id} value={status.id}>
                          {status.type}
                      </option>
                  ))}
              </select>
            </label>

              {/* Ajoutez ici d'autres champs spécifiques à l'édition si nécessaire */}
            </>
          )}
          {!editUser && (
            <>
              <label>
                Mot de passe:
                <input
                  type="password"
                  name="password"
                  value={newUser.password}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <label>
                Adresse:
                <input
                  type="text"
                  name="adresse"
                  value={newUser.adresse}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Date de naissance:
                <input
                  type="date"
                  name="dateDeNaissance"
                  value={newUser.dateDeNaissance}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Rôle:
                <select name="role" value={newUser.role} onChange={handleInputChange}>
                  <option value="adherent">Adhérent</option>
                  <option value="salarier">Salarié</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            </>
          )}
          <button
            className="save-button"
            onClick={editUser ? handleUpdateUser : handleAddUser}
          >
            {editUser ? "Mettre à jour" : "Ajouter"}
          </button>
          <button className="cancel-button" onClick={() => setShowModal(false)}>
            Annuler
          </button>
        </div>
      </div>
    )}
  </div>
);

};

export default Users;
