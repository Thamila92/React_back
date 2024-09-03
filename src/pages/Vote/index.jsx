import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./vote.css";
import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import EditSessionModal from './editSessionModal'; 
import { useNavigate } from 'react-router-dom';

const VoteSession = () => {
  const [voteSessions, setVoteSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Indicateur de chargement
  
  const [newVoteData, setNewVoteData] = useState({
    titre: "",
    description: "",
    modalite: "",
    type: "classique",
    participants: [],
    options: [],
    dateDebut: "",
    dateFin: ""
  });
  const [users, setUsers] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState(null);
  const VITE_URL_API = import.meta.env.VITE_URL_API;

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const eventId = searchParams.get('eventId');

  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true); // Commence le chargement
      try {
        const response = await axios.get(`${VITE_URL_API}/vote-sessions`);
        setVoteSessions(response.data);
      } catch (error) {
        toast.error("Failed to fetch vote sessions.");
      } finally {
        setIsLoading(false); // Termine le chargement
      }
    };

    const fetchUsers = async () => {
      setIsLoading(true); // Commence le chargement
      try {
        const response = await axios.get(`${VITE_URL_API}/listUsers`);
        const salarierUsers = response.data.users.filter(user => user.status.type === 'SALARIER');
        const Users = response.data.users;
        setUsers(Users);
      } catch (error) {
        toast.error("Failed to fetch users.");
      } finally {
        setIsLoading(false); // Termine le chargement
      }
    };

    fetchSessions();
    fetchUsers();
  }, []);

  const handleCreateVoteSession = async () => {
    const { titre, description, modalite, type, participants, options, dateDebut, dateFin } = newVoteData;


    if (new Date(dateDebut) < new Date() || new Date(dateFin) < new Date()) {
      toast.error("Les dates de début et de fin doivent être après aujourd'hui.");
      return;
    }
 

    if (new Date(dateFin) <= new Date(dateDebut)) {
      toast.error("La date de fin doit être après la date de début.");
      return;
    }


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

    const dataToSend = {
      titre,
      description,
      modalite,
      type,
      participants: participants.map(id => Number(id)),
      dateDebut: formattedDateDebut,
      dateFin: formattedDateFin,
    };

    if (type === 'sondage') {
      dataToSend.options = options;
    }

    if (eventId) {
      dataToSend.evenementId = Number(eventId);
    }

    setIsLoading(true); // Indicate que l'action est en cours
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
    } finally {
      setIsLoading(false); // Termine le chargement
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

  const handleDeleteClick = async (session) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la session "${session.titre}" ?`)) {
      setIsLoading(true); // Commence le chargement
      try {
        await axios.delete(`${VITE_URL_API}/vote-sessions/${session.id}`);
        setVoteSessions(voteSessions.filter(vs => vs.id !== session.id));
        toast.success("Vote session deleted successfully!");
      } catch (error) {
        console.error("Error deleting vote session:", error);
        toast.error("Failed to delete vote session.");
      } finally {
        setIsLoading(false); // Termine le chargement
      }
    }
  };

  const handleEditClick = (session) => {
    setSessionToEdit(session);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (editedSession) => {
    setIsLoading(true); // Commence le chargement
    try {
      const response = await axios.put(`${VITE_URL_API}/vote-sessions/${editedSession.id}`, editedSession);
      const updatedSessions = voteSessions.map(session => 
        session.id === editedSession.id ? response.data : session
      );
      setVoteSessions(updatedSessions);
      toast.success("Vote session updated successfully!");
    } catch (error) {
      console.error("Error updating vote session:", error);
      toast.error("Failed to update vote session.");
    } finally {
      setIsLoading(false); // Termine le chargement
    }
  };

  const handleNavigateToVote = () => {
    navigate('/vote'); // Navigate to /vote
  };

  return (
    <div className="vote-session-content">
      <ToastContainer />
      {isLoading && <div className="loading">Chargement...</div>} {/* Indicateur de chargement */}
      <div className="navigate-button-container">
        <button onClick={handleNavigateToVote} className="navigate-button">
          Passer un vote
        </button>
      </div>
      <div className="vote-session-body">
        <div className="vote-session-left">
          <h2>Vote Sessions</h2>
          <div className="session-list">
            {voteSessions.map((session) => (
              <div className="session-item" key={session.id}>
                <span onClick={() => setSelectedSession(session)}>{session.titre}</span>
                <FontAwesomeIcon icon={faEdit} onClick={() => handleEditClick(session)} className="edit-icon" />
                <FontAwesomeIcon icon={faTrash} onClick={() => handleDeleteClick(session)} className="delete-icon" />
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
          <button onClick={handleCreateVoteSession} disabled={isLoading}>
            {isLoading ? 'Création en cours...' : 'Create Session'}
          </button>
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

      <EditSessionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        session={sessionToEdit}
        onSave={handleSaveEdit}
      />
    </div>
  );
};

export default VoteSession;
