import React, { useState, useEffect } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  ArcElement,
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminDashboard.css";

ChartJS.register(
  ArcElement,
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend
);

interface DashboardData {
  totalRevenue: number;
  totalDonations: number;
  totalCotisations: number;
}

interface Paiement {
  id: number;
  stripePaymentId: string;
  amount: number;
  currency: string;
  status: string;
  date: string;
}

interface Cotisation {
  id: number;
  description: string;
  category: string;
  email: string;
  date: string;
  expirationDate: string;
  paiement: Paiement;
}

interface Donation {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  date: string;
  paiement: Paiement;
}

const AdminDashboard: React.FC = () => {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [cotisations, setCotisations] = useState<Cotisation[]>([]);
    const [donations, setDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<string>(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const VITE_URL_API = import.meta.env.VITE_URL_API;
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, [startDate, endDate]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [dashboardResponse, cotisationsResponse, donationsResponse] = await Promise.all([
                axios.get(`${VITE_URL_API}/admin/dashboard`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                    params: { startDate, endDate }
                }),
                axios.get(`${VITE_URL_API}/cotisations`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                    params: { startDate, endDate }
                }),
                axios.get(`${VITE_URL_API}/donations`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                    params: { startDate, endDate }
                })
            ]);
            setDashboardData(dashboardResponse.data);
            setCotisations(cotisationsResponse.data);
            setDonations(donationsResponse.data);
        } catch (error) {
            setError("Erreur lors de la récupération des données.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>Chargement en cours...</p>;
    if (error) return <p>{error}</p>;
    if (!dashboardData) return <p>Aucune donnée disponible.</p>;

    const revenueData = {
        labels: ['Donations', 'Cotisations'],
        datasets: [{
            data: [dashboardData.totalDonations, dashboardData.totalCotisations],
            backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)'],
            borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
            borderWidth: 1,
        }]
    };

    const revenueOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' as const },
            title: { display: true, text: 'Répartition des Revenus' }
        }
    };

    const processDataForChart = () => {
        const monthsSet = new Set([...cotisations, ...donations].map(item => 
            new Date(item.date).toLocaleString('default', { month: 'long', year: 'numeric' })
        ));
        const months = Array.from(monthsSet).sort((a, b) => 
            new Date(a).getTime() - new Date(b).getTime()
        );

        const cotisationsData = months.map(month => 
            cotisations.filter(c => 
                new Date(c.date).toLocaleString('default', { month: 'long', year: 'numeric' }) === month
            ).reduce((sum, c) => sum + c.paiement.amount, 0) / 100
        );

        const donationsData = months.map(month => 
            donations.filter(d => 
                new Date(d.date).toLocaleString('default', { month: 'long', year: 'numeric' }) === month
            ).reduce((sum, d) => sum + d.paiement.amount, 0) / 100
        );

        return { months, cotisationsData, donationsData };
    };

    const { months, cotisationsData, donationsData } = processDataForChart();

    const evolutionData = {
        labels: months,
        datasets: [
            {
                label: 'Cotisations',
                data: cotisationsData,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
            {
                label: 'Donations',
                data: donationsData,
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
            }
        ]
    };

    const evolutionOptions = {
        responsive: true,
        scales: {
            x: { stacked: true },
            y: {
                stacked: true,
                title: { display: true, text: 'Montant (EUR)' }
            }
        },
        plugins: {
            legend: { position: 'top' as const },
            title: { display: true, text: 'Évolution des Revenus' }
        }
    };

    return (
        <div className="admin-dashboard">
            <h1>Tableau de Bord Admin</h1>
            
            <div className="date-range-selector">
                <label>
                    Date de début:
                    <input 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </label>
                <label>
                    Date de fin:
                    <input 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </label>
            </div>

            <div className="chart-section">
                <div className="chart-container">
                    <Doughnut data={revenueData} options={revenueOptions} />
                </div>
                <div className="chart-container">
                    <Bar data={evolutionData} options={evolutionOptions} />
                </div>
            </div>

            <div className="details-container">
                <p>Total des Revenus: {dashboardData.totalRevenue.toFixed(2)} EUR</p>
                <p>Total des Cotisations: {dashboardData.totalCotisations.toFixed(2)} EUR</p>
                <p>Total des Donations: {dashboardData.totalDonations.toFixed(2)} EUR</p>
                
                <div className="actions">
                    <button onClick={() => navigate('/admin/cotisations')}>Voir les Cotisations</button>
                    <button onClick={() => navigate('/admin/donations')}>Voir les Dons</button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;