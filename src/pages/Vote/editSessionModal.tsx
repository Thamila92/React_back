import React, { useState, useEffect } from 'react';
import "./editSession.css";
import axios from 'axios';


function formatDateToDateTimeLocal(date) {
    const newDate = new Date(date);
    const tzOffset = newDate.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = (new Date(newDate.getTime() - tzOffset)).toISOString().slice(0, -8);
    return localISOTime;
  }
  
export const EditSessionModal = ({ isOpen, onClose, session, onSave }) => {
    const initialSessionState = {
        titre: '',
        description: '',
        modalite: '',
        type: '',
        dateDebut: '',
        dateFin: '',
        participants: [],
        options: []  
      };
    const VITE_URL_API = import.meta.env.VITE_URL_API;

    const [editedSession, setEditedSession] = useState(session || initialSessionState);
  
    useEffect(() => {
        if (session) {
          setEditedSession({
            ...session,
            dateDebut: session.dateDebut ? formatDateToDateTimeLocal(session.dateDebut) : '',
            dateFin: session.dateFin ? formatDateToDateTimeLocal(session.dateFin) : ''
          });
        }
      }, [session]);
      
      const handleOptionChange = (e, index) => {
        const newOptions = [...editedSession.options];
        newOptions[index] = e.target.value;
        setEditedSession(prev => ({ ...prev, options: newOptions }));
      };
      
      const handleAddOption = () => {
        setEditedSession(prev => ({ ...prev, options: [...prev.options, ''] }));
      };
      
      const handleRemoveOption = index => {
        const newOptions = editedSession.options.filter((_, idx) => idx !== index);
        setEditedSession(prev => ({ ...prev, options: newOptions }));
      };

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setEditedSession(prev => ({ ...prev, [name]: value }));
    };

    const handleParticipantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => parseInt(option.value));
        setEditedSession(prev => ({
            ...prev,
            participants: prev.participants.filter(p => selectedOptions.includes(p.id))
        }));
    };
  
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!editedSession) {
          console.error('No session data available.');
          return;
        }
      
        // Utilisez un type indexé pour l'objet
        const updatedSessionData: { [key: string]: any } = {};
      
        // Comparer chaque champ pour voir s'il a été modifié
        if (editedSession.titre !== session.titre) {
          updatedSessionData.titre = editedSession.titre;
        }
        if (editedSession.description !== session.description) {
          updatedSessionData.description = editedSession.description;
        }
        if (editedSession.modalite !== session.modalite) {
          updatedSessionData.modalite = editedSession.modalite;
        }
        if (editedSession.type !== session.type) {
          updatedSessionData.type = editedSession.type;
        }
        if (editedSession.dateDebut !== session.dateDebut) {
          updatedSessionData.dateDebut = editedSession.dateDebut;
        }
        if (editedSession.dateFin !== session.dateFin) {
          updatedSessionData.dateFin = editedSession.dateFin;
        }
        if (JSON.stringify(editedSession.participants) !== JSON.stringify(session.participants.map(p => p.id))) {
          updatedSessionData.participants = editedSession.participants.map(p => p.id);
        }
        if (editedSession.type === 'sondage' && JSON.stringify(editedSession.options) !== JSON.stringify(session.options)) {
          updatedSessionData.options = editedSession.options;
        }
      
        // Si aucun champ n'a changé, ne pas envoyer la requête
        if (Object.keys(updatedSessionData).length === 0) {
          alert('No changes made to save.');
          return;
        }
      
        // Ajouter l'id au payload
        updatedSessionData.id = editedSession.id;
      
        // URL de l'API pour la mise à jour de la session
        const url = `${VITE_URL_API}/vote-sessions/${editedSession.id}`;
      
        try {
          const response = await axios.patch(url, updatedSessionData);
          onSave(response.data); // Gérer la réponse
          onClose(); // Fermer le modal en cas de succès
        } catch (error) {
          console.error('Failed to update the session:', error);
          alert('Failed to update the session.');
        }
      };
      
      
  
    if (!isOpen || !editedSession) return null;
  

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Vote Session</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="titre">Title:</label>
            <input
              type="text"
              id="titre"
              name="titre"
              value={editedSession.titre}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              value={editedSession.description}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="participants">Participants:</label>
            <select
                multiple
                id="participants"
                name="participants"
                value={editedSession.participants.map(participant => participant.id)}
                onChange={handleParticipantChange}
                required
            >
                {editedSession.participants.map((participant) => (
                    <option key={participant.id} value={participant.id}>
                        {participant.name} // Assurez-vous que chaque participant a un 'name' et un 'id'
                    </option>
                ))}
            </select>
        </div>

          <div className="form-group">
            <label htmlFor="modalite">Modalité:</label>
            <select
              id="modalite"
              name="modalite"
              value={editedSession.modalite}
              onChange={handleInputChange}
              required
            >
              <option value="majorité_absolue">Majorité Absolue</option>
              <option value="majorité_relative">Majorité Relative</option>
              <option value="un_tour">Un Tour</option>
              <option value="deux_tours">Deux Tours</option>
            </select>
          </div>
<div className="form-group">
  <label htmlFor="type">Type:</label>
  <select
    id="type"
    name="type"
    value={editedSession.type}
    onChange={handleInputChange}
    required
  >
    <option value="classique">Classique</option>
    <option value="sondage">Sondage</option>
  </select>
</div>

{editedSession.type === 'sondage' && (
  <div className="form-group">
    <label htmlFor="options">Options:</label>
    <div>
      {editedSession.options.map((option, index) => (
        <div key={index}>
          <input
            type="text"
            name="options"
            value={option}
            onChange={(e) => handleOptionChange(e, index)}
            required
          />
          <button type="button" onClick={() => handleRemoveOption(index)}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={handleAddOption}>Add Option</button>
    </div>
  </div>
)}

          <div className="form-group">
            <label htmlFor="dateDebut">Date de début:</label>
            <input
              type="datetime-local"
              id="dateDebut"
              name="dateDebut"
              value={editedSession.dateDebut}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="dateFin">Date de fin:</label>
            <input
              type="datetime-local"
              id="dateFin"
              name="dateFin"
              value={editedSession.dateFin}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSessionModal;