import React, { useState, useEffect } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminDashboard.css";

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const AdminDashboard: React.FC = () => {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const VITE_URL_API = import.meta.env.VITE_URL_API;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await axios.get(`${VITE_URL_API}/admin/dashboard`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setDashboardData(response.data);
            } catch (error) {
                setError("Erreur lors de la récupération des données du tableau de bord.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <p>Chargement en cours...</p>;
    if (error) return <p>{error}</p>;

    const revenueData = {
        labels: ['Total Donations', 'Total Cotisations', 'Total Revenue'],
        datasets: [
            {
                label: 'Montants en EUR',
                data: [
                    dashboardData.totalDonations,
                    dashboardData.totalCotisations,
                    dashboardData.totalRevenue,
                ],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.6)', // Donations - Bleu
                    'rgba(255, 206, 86, 0.6)', // Cotisations - Jaune
                    'rgba(75, 192, 192, 0.6)', // Revenue - Vert
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const performanceData = {
        labels: ['Excellent', 'Good', 'Okay', 'Poor'],
        datasets: [
            {
                label: 'Performance',
                data: [47, 40, 16, 3],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)', // Excellent
                    'rgba(54, 162, 235, 0.6)', // Good
                    'rgba(255, 206, 86, 0.6)', // Okay
                    'rgba(255, 99, 132, 0.6)', // Poor
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(255, 99, 132, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="admin-dashboard">
            <h1>Tableau de Bord Admin</h1>
            <div className="chart-section">
                <div className="chart-container">
                    <h2>Répartition des Revenus</h2>
                    <Bar data={revenueData} />
                </div>
                <div className="chart-container">
                    <h2>Performance</h2>
                    <Doughnut data={performanceData} />
                </div>
            </div>

            <div className="details-container">
                <p>Total des Revenus: {dashboardData.totalRevenue} EUR</p>
                <p>Total des Donations: {dashboardData.totalDonations} EUR</p>
                <p>Total des Cotisations: {dashboardData.totalCotisations} EUR</p>
                
                <div className="actions">
                    <button onClick={() => navigate('/admin/donations')}>Voir les Dons</button>
                    <button onClick={() => navigate('/admin/cotisations')}>Voir les Cotisations</button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
