import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './editSession.css';
import { toast, ToastContainer } from "react-toastify";

interface User {
  id: number;
  email: string;
}

interface VoteSession {
  id: number;
  titre: string;
  description: string;
  dateDebut: string;
  dateFin: string;
  participants: number[];
}

interface EditSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: VoteSession | null;
  onSave: (editedFields: Partial<VoteSession>) => void;
}

const VITE_URL_API = import.meta.env.VITE_URL_API;

const EditSessionModal: React.FC<EditSessionModalProps> = ({ isOpen, onClose, session, onSave }) => {
  const [editedFields, setEditedFields] = useState<Partial<VoteSession>>({});
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    if (session) {
      setEditedFields({
        titre: session.titre,
        description: session.description,
        dateDebut: new Date(session.dateDebut).toISOString().slice(0, 16),
        dateFin: new Date(session.dateFin).toISOString().slice(0, 16),
        participants: session.participants,
      });
    }
    fetchUsers();
  }, [session]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${VITE_URL_API}/listUsers`);
      setAllUsers(response.data.users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleParticipantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => Number(option.value));
    setEditedFields((prev) => ({ ...prev, participants: selectedOptions }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (session) {
        console.log("entre")
        //@ts-ignore
        const participantIds = editedFields.participants?.map(participant => participant.id);
        console.log("Transformed participant IDs:", participantIds);

        editedFields.participants = participantIds;

        const response = await axios.patch(`${VITE_URL_API}/vote-sessions/${session.id}`, editedFields);
        console.log("entre")

        toast.success("Vote session updated successfully!");

        onClose();
        console.log("entre")
        return;
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error("Failed to update vote session:", error.response.data);
      } else {
        console.error("Failed to update vote session:", error);
      }
    }
  };

  if (!session || !isOpen) return null;

  return (
    
    <div className="modal-overlay">
       <ToastContainer />

      <div className="modal-content">
        <h2>Edit Vote Session</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="titre">Title</label>
            <input
              type="text"
              id="titre"
              name="titre"
              value={editedFields.titre || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={editedFields.description || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="dateDebut">Start Date</label>
            <input
              type="datetime-local"
              id="dateDebut"
              name="dateDebut"
              value={editedFields.dateDebut || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="dateFin">End Date</label>
            <input
              type="datetime-local"
              id="dateFin"
              name="dateFin"
              value={editedFields.dateFin || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="participants">Participants</label>
            <select
              multiple
              id="participants"
              name="participants"
              value={editedFields.participants?.map(String) || []}
              onChange={handleParticipantChange}
            >
              {allUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.email}
                </option>
              ))}
            </select>
          </div>
          <div className="button-group">
            <button type="submit">Save Changes</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSessionModal;
