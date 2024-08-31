import { useState, useEffect } from "react";
import './home.css';
import getdate from "../../utils/getDate.js";
import Chatbot from "react-chatbot-kit";
import MessageParser from "../../chatbot/messageParser.js";
import config from "../../chatbot/config.js";
import ActionProvider from "../../chatbot/ActionProvider.js";
import 'react-chatbot-kit/build/main.css';
import companionnChatBot from './companionnChatBot.png';
import { VideoRoom } from "../../components/videoroom.jsx";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaPlus, FaTrash } from "react-icons/fa";

const Home = () => {
  const [today, setToday] = useState('');
  const [showChatbot, setShowChatbot] = useState(false);
  const [joined, setJoined] = useState(false);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEventForm, setShowEventForm] = useState(false);  // Pour afficher/cacher le formulaire
  const navigate = useNavigate();

  const VITE_URL_API = import.meta.env.VITE_URL_API;

  const eventTypes = [
    { label: "Assemblée Générale", value: "AG" },
    { label: "Porte Ouverte", value: "PORTE_OUVERTE" },
    { label: "Conférence", value: "CONFERENCE" },
    { label: "Atelier", value: "ATELIER" },
    { label: "Séminaire", value: "SEMINAIRE" },
    { label: "Réunion", value: "REUNION" }
  ];
  
  const [eventData, setEventData] = useState({
    type: "",
    description: "",
    starting: "",
    ending: "",
    attendees: [],
    location: "",
    repetitivity: "",
    quorum: 0,
    isVirtual: false,
    virtualLink: "",
    maxParticipants: 0,
    currentParticipants: 0,
    membersOnly: false,
    state: "UNSTARTED"
  });

  useEffect(() => {
 
    const token = localStorage.getItem('token');
    const statusType = localStorage.getItem('statusType');
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('name');
    const userEmail = localStorage.getItem('email');
  
    console.log("Token:", token);
    console.log("Status Type:", statusType);
    console.log("User ID:", userId);
    console.log("User Name:", userName);
    console.log("User Email:", userEmail);
    if (!token) {
      navigate("/");
      return;
    }

    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Fetch Events
        const eventResponse = await axios.get(`${VITE_URL_API}/evenements`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        setEvents(eventResponse.data.evenements);

        // Fetch Users
        const userResponse = await axios.get(`${VITE_URL_API}/listUsers`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setUsers(userResponse.data.users);
      } catch (error) {
        setError("Failed to fetch data");
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
    setToday(getdate());

  }, [navigate]);

  const toggleChatbot = () => {
    setShowChatbot(prevShowChatbot => !prevShowChatbot);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      // Préparer les données à envoyer
      const preparedEventData = {
        ...eventData,
      };
  
      // Supprimer le champ 'state' si l'API ne l'attend pas ou si ce n'est pas nécessaire
      delete preparedEventData.state;
  
      // Supprimer d'autres champs inutiles si ce n'est pas un événement de type 'AG'
      if (preparedEventData.type !== "AG") {
        delete preparedEventData.repetitivity;
        delete preparedEventData.quorum;
      }
  
      // Envoi de la requête à l'API
      const response = await axios.post(`${VITE_URL_API}/evenements`, preparedEventData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
  
      toast.success("Event created successfully!");
      setEventData({
        type: "",
        description: "",
        starting: "",
        ending: "",
        attendees: [],
        location: "",
        repetitivity: "",
        quorum: 0,
        isVirtual: false,
        virtualLink: "",
        maxParticipants: 0,
        currentParticipants: 0,
        membersOnly: false,
      });
    } catch (error) {
      console.error("Error creating event:", error);
  
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        toast.error(`Error: ${error.response.data?.message || "Bad Request"}`);
      } else {
        console.error("Error without response:", error);
        toast.error("Failed to create event. Please try again.");
      }
    }
  };
  
  const handleCreateVote = (eventId) => {
    // Redirige vers /admin-vote avec l'ID de l'événement
    navigate(`/admin_vote?eventId=${eventId}`);
  };

  const handleDelete = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await axios.delete(`${VITE_URL_API}/evenements/${eventId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setEvents(events.filter(event => event.id !== eventId));
        toast.success("Event deleted successfully!");
      } catch (error) {
        console.error("Error deleting event:", error);
        toast.error("Failed to delete event");
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="home-content">
      <div className="today">
        <p className="today-text">{today}</p>
      </div>
      <div className="home-body">
        <img
          src={companionnChatBot}
          alt="Toggle Chatbot"
          className="toggle-chatbot-image"
          onClick={toggleChatbot}
        />
        {showChatbot && (
          <div className="chatbot-container">
            <Chatbot
              config={config}
              actionProvider={ActionProvider}
              messageParser={MessageParser}
            />
          </div>
        )}
        <div>
          <div className="event-form-container">
            <h1 className="form-title">New Assembly</h1>
            <hr />
            <button onClick={() => setShowEventForm(!showEventForm)}>
              <FaPlus /> Add Event
            </button>

            {showEventForm && (
              <div>
                <label>
                  Starting:
                  <input
                    type="datetime-local"
                    name="starting"
                    value={eventData.starting}
                    onChange={handleInputChange}
                  />
                </label>
                <label>
                  Ending:
                  <input
                    type="datetime-local"
                    name="ending"
                    value={eventData.ending}
                    onChange={handleInputChange}
                  />
                </label>
                <label>
                  Location:
                  <input
                    type="text"
                    name="location"
                    value={eventData.location}
                    onChange={handleInputChange}
                  />
                </label>
                <label>
                  Type:
                  <select
                  name="type"
                  value={eventData.type}
                  onChange={handleInputChange}
                >
                  <option value="">Select type</option>
                  {eventTypes.map((eventType, index) => (
                    <option key={index} value={eventType.value}>
                      {eventType.label}
                    </option>
                  ))}
                </select>

                </label>
                <label>
                  Repetitivity:
                  <select
                    name="repetitivity"
                    value={eventData.repetitivity}
                    onChange={handleInputChange}
                  >
                    <option value="">Select repetitivity</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="ANNUAL">Annual</option>
                    <option value="NONE">None</option>
                  </select>
                </label>

                {/* Ajout des nouveaux champs */}
                <label>
                  Max Participants:
                  <input
                    type="number"
                    name="maxParticipants"
                    value={eventData.maxParticipants}
                    onChange={handleInputChange}
                  />
                </label>
                <label>
                  Current Participants:
                  <input
                    type="number"
                    name="currentParticipants"
                    value={eventData.currentParticipants}
                    onChange={handleInputChange}
                  />
                </label>
                <label>
                  Members Only:
                  <select
                    name="membersOnly"
                    value={eventData.membersOnly}
                    onChange={handleInputChange}
                  >
                    <option value={false}>No</option>
                    <option value={true}>Yes</option>
                  </select>
                </label>
                <label>
                  State:
                  <select
                    name="state"
                    value={eventData.state}
                    onChange={handleInputChange}
                  >
                    <option value="UNSTARTED">Unstarted</option>
                    <option value="ONGOING">Ongoing</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </label>
                <label>
                  Virtual:
                  <select
                    name="isVirtual"
                    value={eventData.isVirtual}
                    onChange={handleInputChange}
                  >
                    <option value={false}>No</option>
                    <option value={true}>Yes</option>
                  </select>
                </label>
                <label>
                  Description:
                  <input
                    type="text"
                    name="description"
                    value={eventData.description}
                    onChange={handleInputChange}
                  />
                </label>
                <button onClick={handleSubmit}>Create</button>
              </div>
            )}

            <hr />
            {!joined && (
              <button onClick={() => setJoined(true)}>Join Companion Room</button>
            )}
            {joined && <VideoRoom virtualLink={eventData.virtualLink} />}
            <br />
            <br />
            <p>
              {eventData.virtualLink ? (
                <a href={eventData.virtualLink} target="_blank" rel="noopener noreferrer">
                  Join the meeting using this link
                </a>
              ) : (
                "No link available"
              )}
            </p>
          </div>

          <div className="event-table-container">
            <table className="event-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Quorum</th>
                  <th>Starting</th>
                  <th>Ending</th>
                  <th>Repetitivity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event, index) => (
                  <tr key={index}>
                    <td>{event.description}</td>
                    <td>{event.type}</td>
                    <td>{event.quorum}</td>
                    <td>{new Date(event.starting).toLocaleString()}</td>
                    <td>{new Date(event.ending).toLocaleString()}</td>
                    <td>{event.repetitivity}</td>
                    <td>
                      <button onClick={() => handleDelete(event.id)}>
                        <FaTrash />
                      </button>
                      {event.type === "AG" && (
                        <button onClick={() => handleCreateVote(event.id)}>
                          Créer un Vote
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
