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
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [editedEventData, setEditedEventData] = useState({});
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

  const handleDoubleClick = (event) => {
    setEditingEventId(event.id);
    setEditedEventData({ ...event }); // Prendre une copie des données de l'événement
  };

  const handleSaveEdit = async (eventId) => {
    try {
      // Créez un objet avec uniquement les champs modifiés
      const updatedFields = {};
      for (const key in editedEventData) {
        if (editedEventData[key] !== events.find(event => event.id === eventId)[key]) {
          updatedFields[key] = editedEventData[key];
        }
      }

      if (Object.keys(updatedFields).length === 0) {
        toast.info("No changes made.");
        setEditingEventId(null);
        return;
      }

      const response = await axios.patch(`${VITE_URL_API}/evenements/${eventId}`, updatedFields, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      // Mettre à jour l'état des événements avec les données modifiées
      setEvents(events.map(event => (event.id === eventId ? response.data : event)));
      toast.success("Event updated successfully!");
      setEditingEventId(null);
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Failed to update event.");
    }
  };

  const handleCancelEdit = () => {
    setEditingEventId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    // Vérification des dates avant la soumission
    if (new Date(eventData.starting) < new Date() || new Date(eventData.ending) < new Date()) {
      toast.error("Starting and ending dates must be in the future.");
      return;
    }

    try {
      setLoading(true);
      const preparedEventData = { ...eventData };

      delete preparedEventData.state;

      if (preparedEventData.type !== "AG") {
        delete preparedEventData.repetitivity;
        delete preparedEventData.quorum;
      }

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
      setEvents([...events, response.data]);
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVote = (eventId) => {
    navigate(`/admin_vote?eventId=${eventId}`);
  };

  const handleDelete = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="home-content">
      <div className="today">
      <p className="today-text" style={{ color: 'white' }}>{today}</p>
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
                    required
                  />
                </label>
                <label>
                  Ending:
                  <input
                    type="datetime-local"
                    name="ending"
                    value={eventData.ending}
                    onChange={handleInputChange}
                    required
                  />
                </label>
                <label>
                  Description:
                  <input
                    type="text"
                    name="description"
                    value={eventData.description}
                    onChange={handleInputChange}
                    required
                  />
                </label>
                <label>
                  Attendees:
                  <select
                    name="attendees"
                    value={eventData.attendees}
                    onChange={handleInputChange}
                    multiple
                  >
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
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
                  Repetitivity:
                  <input
                    type="text"
                    name="repetitivity"
                    value={eventData.repetitivity}
                    onChange={handleInputChange}
                  />
                </label>
                <button onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            )}

            <ul>
              {events.map(event => (
                <li key={event.id} onDoubleClick={() => handleDoubleClick(event)}>
                  <p>{event.description}</p>
                  <button onClick={() => handleCreateVote(event.id)}>Create Vote</button>
                  <button onClick={() => handleDelete(event.id)}>
                    <FaTrash /> Delete
                  </button>

                  {editingEventId === event.id && (
                    <div>
                      <label>
                        Starting:
                        <input
                          type="datetime-local"
                          name="starting"
                          value={editedEventData.starting}
                          onChange={(e) => setEditedEventData({ ...editedEventData, starting: e.target.value })}
                        />
                      </label>
                      <label>
                        Ending:
                        <input
                          type="datetime-local"
                          name="ending"
                          value={editedEventData.ending}
                          onChange={(e) => setEditedEventData({ ...editedEventData, ending: e.target.value })}
                        />
                      </label>
                      <label>
                        Description:
                        <input
                          type="text"
                          name="description"
                          value={editedEventData.description}
                          onChange={(e) => setEditedEventData({ ...editedEventData, description: e.target.value })}
                        />
                      </label>
                      <button onClick={() => handleSaveEdit(event.id)}>Save</button>
                      <button onClick={handleCancelEdit}>Cancel</button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
