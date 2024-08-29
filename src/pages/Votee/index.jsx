import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './vote.css';

const VotingSystem = () => {
  const [voteSessions, setVoteSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [voteChoice, setVoteChoice] = useState("");  // Pour stocker le choix de vote de l'utilisateur
  const [resultats, setResultats] = useState(null);  // Pour stocker les résultats des votes
  const [userId, setUserId] = useState(2);  // Id fictif pour le vote, à adapter selon ton contexte d'authentification

  const VITE_URL_API = import.meta.env.VITE_URL_API;

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.get(`${VITE_URL_API}/vote-sessions`);
        setVoteSessions(response.data);
      } catch (error) {
        toast.error("Failed to fetch vote sessions.");
      }
    };

    fetchSessions();
  }, []);

  const handleSessionClick = (session) => {
    setSelectedSession(session);
    setResultats(null);
  };
  const handleVoteSubmit = async () => {
    if (!voteChoice) {
        toast.error("Please select a choice.");
        return;
    }

    try {
        // Préparer les données à envoyer en fonction du type de session
        const requestData = {
            userId: userId,
            sessionId: selectedSession.id,
        };

        if (selectedSession.type === "sondage") {
            requestData.optionId = voteChoice;  // Pour les sondages, utiliser optionId
        } else {
            requestData.choix = voteChoice;  // Pour les votes classiques, utiliser choix
        }

        // Envoyer la requête avec les données appropriées
        const response = await axios.post(`${VITE_URL_API}/votes`, requestData);

        toast.success("Vote submitted successfully!");
        await fetchResults(selectedSession.id);
    } catch (error) {
        toast.error("Failed to submit vote.");
        console.error("Error during vote submission:", error);
    }
};


  const fetchResults = async (sessionId) => {
    try {
      const response = await axios.get(`${VITE_URL_API}/vote-results/${sessionId}`);
      setResultats(response.data);
    } catch (error) {
      toast.error("Failed to fetch vote results.");
      console.error("Error fetching vote results:", error);
    }
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
                onClick={() => handleSessionClick(session)}
              >
                {session.titre}
              </div>
            ))}
          </div>
        </div>

        <div className="vote-session-right">
          {selectedSession && (
            <div>
              <h2>Session Details</h2>
              <p><strong>Title:</strong> {selectedSession.titre}</p>
              <p><strong>Description:</strong> {selectedSession.description}</p>
              <p><strong>Modalité:</strong> {selectedSession.modalite}</p>

              <div>
                <h3>Votez :</h3>
                {selectedSession.type === "sondage" ? (
                  selectedSession.options && selectedSession.options.length > 0 ? (
                    // Afficher les options si c'est un sondage
                    selectedSession.options.map(option => (
                      <label key={option.id}>
                        <input
                          type="radio"
                          value={option.id}
                          checked={voteChoice === String(option.id)}
                          onChange={(e) => setVoteChoice(e.target.value)}
                        />
                        {option.titre}
                      </label>
                    ))
                  ) : (
                    <p>Aucune option disponible pour ce sondage.</p>
                  )
                ) : (
                  <>
                    <label>
                      <input
                        type="radio"
                        value="pour"
                        checked={voteChoice === "pour"}
                        onChange={(e) => setVoteChoice(e.target.value)}
                      />
                      Pour
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="contre"
                        checked={voteChoice === "contre"}
                        onChange={(e) => setVoteChoice(e.target.value)}
                      />
                      Contre
                    </label>
                  </>
                )}
                <button onClick={handleVoteSubmit}>Submit Vote</button>
              </div>

              {resultats && (
                <div className="resultats">
                  <h3>Résultats du vote</h3>
                  {selectedSession.type === "sondage" ? (
                    selectedSession.options.map(option => (
                      <p key={option.id}>
                        <strong>{option.titre} :</strong> {resultats[option.id]} votes
                      </p>
                    ))
                  ) : (
                    <>
                      <p><strong>Pour :</strong> {resultats.pourVotes}</p>
                      <p><strong>Contre :</strong> {resultats.contreVotes}</p>
                    </>
                  )}
                  <p><strong>Gagnant :</strong> {resultats.gagnant ? resultats.gagnant : 'Pas encore de gagnant'}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VotingSystem;
