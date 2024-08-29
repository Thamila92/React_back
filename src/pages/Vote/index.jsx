import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./vote.css";
import { useLocation } from "react-router-dom";

const VoteSession = () => {
  const [voteSessions, setVoteSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [newVoteData, setNewVoteData] = useState({
    titre: "",
    description: "",
    modalite: "",
    type: "classique", // Par défaut "classique"
    participants: [],
    options: [], // Options pour les sondages
    dateDebut: "",
    dateFin: ""
  });
  const [users, setUsers] = useState([]); // Liste des utilisateurs récupérée du backend
  const VITE_URL_API = import.meta.env.VITE_URL_API;

  // Récupérer l'eventId des paramètres de l'URL
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const eventId = searchParams.get('eventId');

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.get(`${VITE_URL_API}/vote-sessions`);
        setVoteSessions(response.data);
      } catch (error) {
        toast.error("Failed to fetch vote sessions.");
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${VITE_URL_API}/listUsers`);
        const salarierUsers = response.data.users.filter(user => user.status.type === 'SALARIER');
        setUsers(salarierUsers);
      } catch (error) {
        toast.error("Failed to fetch users.");
      }
    };

    fetchSessions();
    fetchUsers();
  }, []);

  const handleCreateVoteSession = async () => {
    const { titre, description, modalite, type, participants, options, dateDebut, dateFin } = newVoteData;

    if (!titre || !description || !modalite || !type || !participants.length || !dateDebut || !dateFin) {
      toast.error("Please fill all fields.");
      return;
    }

    if (type === 'sondage' && options.length < 2) {
      toast.error("Please add at least two options for the survey.");
      return;
    }

    const formattedDateDebut = new Date(dateDebut).toISOString();
    const formattedDateFin = new Date(dateFin).toISOString();

    // Construire les données à envoyer
    const dataToSend = {
      titre,
      description,
      modalite,
      type,
      participants: participants.map(id => Number(id)),
      dateDebut: formattedDateDebut,
      dateFin: formattedDateFin,
    };

    // Ajouter "options" uniquement si le type est "sondage"
    if (type === 'sondage') {
      dataToSend.options = options;
    }

    // Ajouter l'eventId si présent
    if (eventId) {
      dataToSend.evenementId = Number(eventId); // Assurer que c'est un nombre
    }

    try {
      const response = await axios.post(`${VITE_URL_API}/vote-sessions`, dataToSend);
      console.log("Réponse de l'API :", response.data);

      toast.success("Vote session created successfully!");
      setVoteSessions([...voteSessions, response.data]);
      setNewVoteData({
        titre: "",
        description: "",
        modalite: "",
        type: "classique",
        participants: [],
        options: [],
        dateDebut: "",
        dateFin: ""
      });
    } catch (error) {
      console.error("Erreur lors de la création de la session de vote :", error);
      toast.error("Failed to create vote session.");
    }
  };

  const handleInputChange = (e) => {
    setNewVoteData({ ...newVoteData, [e.target.name]: e.target.value });
  };

  const handleParticipantChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setNewVoteData({ ...newVoteData, participants: selectedOptions });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...newVoteData.options];
    newOptions[index] = value;
    setNewVoteData({ ...newVoteData, options: newOptions });
  };

  const addOption = () => {
    setNewVoteData({ ...newVoteData, options: [...newVoteData.options, ""] });
  };

  const removeOption = (index) => {
    const newOptions = newVoteData.options.filter((_, i) => i !== index);
    setNewVoteData({ ...newVoteData, options: newOptions });
  };

  return (
    <div className="vote-session-content">
      <ToastContainer />
      <div className="vote-session-body">
        <div className="vote-session-left">
          <h2>Vote Sessions</h2>
          <div className="session-list">
            {voteSessions.map((session) => (
              <div
                className="session-item"
                key={session.id}
                onClick={() => setSelectedSession(session)}
              >
                {session.titre}
              </div>
            ))}
          </div>
        </div>

        <div className="create-session">
          <h2>Create New Vote Session</h2>
          <input
            type="text"
            name="titre"
            value={newVoteData.titre}
            placeholder="Title"
            onChange={handleInputChange}
          />
          <textarea
            name="description"
            value={newVoteData.description}
            placeholder="Description"
            onChange={handleInputChange}
          ></textarea>
          <select
            name="modalite"
            value={newVoteData.modalite}
            onChange={handleInputChange}
          >
            <option value="">Select Modalite</option>
            <option value="majorité_absolue">Majorité Absolue</option>
            <option value="majorité_relative">Majorité Relative</option>
            <option value="un_tour">Un Tour</option>
            <option value="deux_tours">Deux Tours</option>
          </select>
          <select
            name="type"
            value={newVoteData.type}
            onChange={handleInputChange}
          >
            <option value="classique">Classique</option>
            <option value="sondage">Sondage</option>
          </select>

          {newVoteData.type === 'sondage' && (
            <div className="options-section">
              <h3>Options du Sondage</h3>
              {newVoteData.options.map((option, index) => (
                <div key={index} className="option-item">
                  <input
                    type="text"
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                  />
                  <button onClick={() => removeOption(index)}>Remove</button>
                </div>
              ))}
              <button onClick={addOption}>Add Option</button>
            </div>
          )}

          {/* Sélection multiple pour les participants */}
          <select
            multiple
            name="participants"
            onChange={handleParticipantChange}
            value={newVoteData.participants}
            size="5"
          >
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.email}</option>
            ))}
          </select>
          <input
            type="datetime-local"
            name="dateDebut"
            value={newVoteData.dateDebut}
            onChange={handleInputChange}
          />
          <input
            type="datetime-local"
            name="dateFin"
            value={newVoteData.dateFin}
            onChange={handleInputChange}
          />
          <button onClick={handleCreateVoteSession}>Create Session</button>
        </div>
      </div>

      {selectedSession && (
        <div className="session-details">
          <h2>Session Details</h2>
          <p><strong>Title:</strong> {selectedSession.titre}</p>
          <p><strong>Description:</strong> {selectedSession.description}</p>
          <p><strong>Type:</strong> {selectedSession.type}</p>
          <p><strong>Rounds:</strong> {selectedSession.tourActuel}</p>
          <p><strong>Start Date:</strong> {new Date(selectedSession.dateDebut).toLocaleString()}</p>
          <p><strong>End Date:</strong> {new Date(selectedSession.dateFin).toLocaleString()}</p>
          <p><strong>Modalité:</strong> {selectedSession.modalite}</p>
          <p><strong>Participants:</strong> {selectedSession.participants.map(p => p.email).join(", ")}</p>

          {selectedSession.type === 'sondage' && selectedSession.options && (
            <div>
              <h3>Options:</h3>
              <ul>
                {selectedSession.options.map((option, index) => (
                  <li key={index}>{option.titre}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VoteSession;
