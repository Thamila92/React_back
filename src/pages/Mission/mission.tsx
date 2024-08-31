import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./mission.css";

interface Mission {
  id: number;
  description: string;
  starting: string;
  ending: string;
  state: string;
  requiredSkills: { id: number; name: string }[];
}

const Missions: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const VITE_URL_API = import.meta.env.VITE_URL_API;

  useEffect(() => {
    const fetchMissions = async () => {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        navigate("/");
        return;
      }

      try {
        const response = await axios.get(`${VITE_URL_API}/missions/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        console.log(response.data);

        if (Array.isArray(response.data)) {
          setMissions(response.data);
        } else if (Array.isArray(response.data.missions)) {
          setMissions(response.data.missions);
        } else {
          throw new Error("Expected an array of missions");
        }
      } catch (error) {
        console.error("Error fetching missions:", error);
        setError("Failed to load missions");
        toast.error("Failed to load missions");
      } finally {
        setLoading(false);
      }
    };

    fetchMissions();
  }, [VITE_URL_API, navigate]);

  const getStatusColor = (starting: string, ending: string) => {
    const currentDate = new Date();
    const startDate = new Date(starting);
    const endDate = new Date(ending);

    if (currentDate < startDate) {
      return "blue"; // Upcoming
    } else if (currentDate > endDate) {
      return "red"; // Ended
    } else {
      return "green"; // Ongoing
    }
  };

  if (loading) return <p>Loading missions...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="missions-container">
      <h1>Your Missions</h1>
      {missions.length > 0 ? (
        <ul className="missions-list">
          {missions.map((mission) => (
            <li key={mission.id} className="mission-item">
              <div className="mission-header">
                <h2>{mission.description}</h2>
                <button
                  className="status-indicator"
                  style={{
                    backgroundColor: getStatusColor(mission.starting, mission.ending),
                  }}
                  aria-label="Mission status"
                />
              </div>
              <p>
                <strong>Starting:</strong> {new Date(mission.starting).toLocaleString()}
              </p>
              <p>
                <strong>Ending:</strong> {new Date(mission.ending).toLocaleString()}
              </p>
              <p>
                <strong>Status:</strong> {mission.state}
              </p>
              <p>
                <strong>Required Skills:</strong> {mission.requiredSkills.map(skill => skill.name).join(', ')}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No missions assigned to you.</p>
      )}
    </div>
  );
};

export default Missions;
