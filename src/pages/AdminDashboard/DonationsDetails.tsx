// DonationsDetails.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const DonationsDetails: React.FC = () => {
    const [donations, setDonations] = useState<any[]>([]);

    useEffect(() => {
        const fetchDonations = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_URL_API}/admin/donations`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setDonations(response.data.donations);
            } catch (error) {
                console.error("Erreur lors de la récupération des dons.");
            }
        };

        fetchDonations();
    }, []);

    return (
        <div className="donations-details">
            <h2>Détails des Dons</h2>
            <ul>
                {donations.map((donation, index) => (
                    <li key={index}>
                        {donation.nom} {donation.prenom} - {donation.paiement.amount / 100} EUR
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DonationsDetails;
