import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './vote.css';

const VotingSystem = () => {
  const [voteSessions, setVoteSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [voteChoice, setVoteChoice] = useState('');
  const [resultats, setResultats] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const userId = Number(localStorage.getItem('userId')); // Convertir userId en nombre

  const VITE_URL_API = import.meta.env.VITE_URL_API;

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.get(`${VITE_URL_API}/vote-sessions`);
        const allSessions = response.data;
    
        // Filtrer les sessions où l'utilisateur actuel est un participant
        const filteredSessions = allSessions.filter(session => 
          session.participants.some(participant => 
            participant.id === userId && 
            (participant.status.type === 'SALARIER' || participant.status.type === 'ADMIN')
          )
        );
    
        if (filteredSessions.length === 0) {
          toast.info("Vous n'avez pas encore de session de vote.");
        }
    
        setVoteSessions(filteredSessions);
      } catch (error) {
        toast.error("Failed to fetch vote sessions.");
        console.error("Error fetching vote sessions:", error);
      }
    };
    

    fetchSessions();
  }, [userId, VITE_URL_API]);

  const handleSessionClick = async (session) => {
    setSelectedSession(session);
    setResultats(null);
    setVoteChoice('');
    setHasVoted(false);

    try {
      const response = await axios.get(`${VITE_URL_API}/votes/hasVoted`, {
        params: { userId, sessionId: session.id }
      });
      if (response.data.hasVoted) {
        setHasVoted(true);
        toast.info("You have already voted in this session.");
        fetchResults(session.id);
      }
    } catch (error) {
      toast.error("Failed to check if user has voted.");
    }
  };

  const handleVoteSubmit = async () => {
    if (!voteChoice) {
      toast.error("Please select a choice.");
      return;
    }
  
    try {
      const requestData = selectedSession.type === "sondage" ?
        { userId, sessionId: selectedSession.id, optionId: parseInt(voteChoice) } :
        { userId, sessionId: selectedSession.id, choix: voteChoice };
  
      const response = await axios.post(`${VITE_URL_API}/votes`, requestData);
      if (response.status === 201) {
        toast.success("Vote submitted successfully!");
        fetchResults(selectedSession.id);
        setHasVoted(true); // Indique que l'utilisateur a voté
      }
    } catch (error) {
      toast.error("Failed to submit vote.");
      console.error("Error during vote submission:", error.response ? error.response.data : error.message);
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
            {voteSessions.length > 0 ? (
              voteSessions.map((session) => (
                <div
                  className="session-item"
                  key={session.id}
                  onClick={() => handleSessionClick(session)}
                >
                  {session.titre}
                </div>
              ))
            ) : (
              <p>Vous n'avez pas encore de session de vote.</p>
            )}
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
                {hasVoted ? (
                  <p>You have already voted.</p>
                ) : (
                  <>
                    {selectedSession.options && selectedSession.options.length > 0 ? (
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
                    <button onClick={handleVoteSubmit} disabled={hasVoted}>Submit Vote</button>
                  </>
                )}
              </div>

              {resultats && (
                <div className="resultats">
                  <h3>Résultats du vote</h3>
                  {selectedSession.type === "sondage" ? (
                    selectedSession.options.map(option => (
                      <p key={option.id}>
                        <strong>{option.titre} :</strong> {resultats.pourcentage[option.id].votes} votes ({resultats.pourcentage[option.id].pourcentage}%)
                      </p>
                    ))
                  ) : (
                    <>
                      <p><strong>Pour :</strong> {resultats.pourcentage.pour.votes} ({resultats.pourcentage.pour.pourcentage}%)</p>
                      <p><strong>Contre :</strong> {resultats.pourcentage.contre.votes} ({resultats.pourcentage.contre.pourcentage}%)</p>
                    </>
                  )}
                  <p><strong>Gagnant :</strong> {resultats.gagnant}</p>
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
