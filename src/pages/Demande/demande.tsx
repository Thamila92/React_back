import React, { useState, useEffect } from 'react';
import './demande.css';

// Définir le type de la demande
type Demande = {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    titre: string;
    budget: number;
    deadline: string;
    statut: string;
};

const Demandes = () => {
    const [demandes, setDemandes] = useState<Demande[]>([]);
    const VITE_URL_API = import.meta.env.VITE_URL_API;

    // Charger les demandes
    useEffect(() => {
        fetch(`${VITE_URL_API}/demandes`)
            .then(response => response.json())
            .then(data => setDemandes(data))
            .catch(error => console.error('Erreur lors de la récupération des demandes:', error));
    }, []);

    // Valider une demande
    const handleValidate = async (id: number) => {
        try {
            const response = await fetch(`${VITE_URL_API}/demandes/${id}/valider`, {
                method: 'PATCH',
            });
            if (response.ok) {
                setDemandes(demandes.map(demande => demande.id === id ? { ...demande, statut: 'approuvée' } : demande));
            } else {
                console.error('Erreur lors de la validation de la demande');
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    // Rejeter une demande
    const handleReject = async (id: number) => {
        try {
            const response = await fetch(`${VITE_URL_API}/demandes/${id}/rejeter`, {
                method: 'PATCH',
            });
            if (response.ok) {
                setDemandes(demandes.map(demande => demande.id === id ? { ...demande, statut: 'rejetée' } : demande));
            } else {
                console.error('Erreur lors du rejet de la demande');
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    // Supprimer une demande
    const handleDelete = async (id: number) => {
        try {
            const response = await fetch(`${VITE_URL_API}/demandes/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setDemandes(demandes.filter(demande => demande.id !== id));
            } else {
                console.error('Erreur lors de la suppression de la demande');
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    return (
        <div className="demandes-container">
            <h1>Liste des Demandes</h1>
            <table className="demandes-table">
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Titre</th>
                        <th>Budget</th>
                        <th>Deadline</th>
                        <th>Statut</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {demandes.map((demande) => (
                        <tr key={demande.id}>
                            <td>{demande.nom} {demande.prenom}</td>
                            <td>{demande.email}</td>
                            <td>{demande.titre}</td>
                            <td>{demande.budget} €</td>
                            <td>{demande.deadline}</td>
                            <td>{demande.statut}</td>
                            <td>
                                <button className="btn-validate" onClick={() => handleValidate(demande.id)}>✔️</button>
                                <button className="btn-reject" onClick={() => handleReject(demande.id)}>❌</button>
                                <button className="btn-delete" onClick={() => handleDelete(demande.id)}>🗑️</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Demandes;
