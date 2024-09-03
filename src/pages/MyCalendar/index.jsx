import { Calendar, dayjsLocalizer } from 'react-big-calendar';
import dayjs from 'dayjs';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useEffect, useState } from 'react';
import getdate from "../../utils/getDate.js";
import './mycalendar.css';
import axios from 'axios';

const MyCalendar = () => {
  const localizer = dayjsLocalizer(dayjs);
  const [today, setToday] = useState("");
  const [myEventsList, setMyEventsList] = useState([]);
  const [myStepsList, setMyStepsList] = useState([]);
  const [myProjetsList, setMyProjetsList] = useState([]);
  const [myMissionsList, setMyMissionsList] = useState([]);
  const API_URL = import.meta.env.VITE_URL_API;

  // Convertir une chaîne de date en objet Date
  const getTime = (dateString) => new Date(dateString);

  // Structurer les événements reçus
  const getStructuredEvents = (events) => {
    return events.map(event => ({
      title: `${event.type} - ${event.description} ${event.location[0]?.position || ''}`,
      start: getTime(event.starting),
      end: getTime(event.ending),
      allDay: false,
      resource: {
        state: event.state,
        type: event.type,
        description: event.description,
        location: event.location[0]?.position || '',
        virtualLink: event.isVirtual ? event.virtualLink : null,
      }
    }));
  };

  // Structurer les étapes (steps) reçues
  const getStructuredSteps = (steps) => {
    return steps.map(step => ({
      title: `${step.state} ${step.location?.[0]?.position || ''}`,
      start: getTime(step.starting),
      end: getTime(step.ending),
      allDay: false,
      resource: {
        state: step.state,
        location: step.location?.[0]?.position || '',
      }
    }));
  };

  // Structurer les missions reçues
  const getStructuredMissions = (missions) => {
    return missions.map(mission => ({
      title: `Mission: ${mission.description}`,
      start: getTime(mission.starting),
      end: getTime(mission.ending),
      allDay: false,
      resource: {
        description: mission.description,
      }
    }));
  };

  // Structurer les projets et leurs étapes (steps) reçus
  const getStructuredProjets = (projets) => {
    const structuredProjets = projets.map(projet => ({
      title: `Projet: ${projet.description}`,
      start: getTime(projet.starting),
      end: getTime(projet.ending),
      allDay: false,
      resource: {
        description: projet.description,
      }
    }));

    const structuredSteps = projets.flatMap(projet =>
      projet.steps.map(step => ({
        title: `${step.state} - ${projet.description}: ${step.description}`,
        start: getTime(step.starting),
        end: getTime(step.ending),
        allDay: false,
        resource: {
          state: step.state,
          description: step.description,
        }
      }))
    );

    return [...structuredProjets, ...structuredSteps];
  };

  // Fetch des événements depuis l'API
  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_URL}/evenements`, {
        headers: { 'Content-Type': 'application/json' }
      });
      const events = response.data.evenements;
      setMyEventsList(getStructuredEvents(events));
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

 

 

  // Fetch des missions depuis l'API
  const fetchMissions = async () => {
    try {
      const response = await axios.get(`${API_URL}/missions`, {
        headers: { 'Content-Type': 'application/json' }
      });
      const missions = response.data.missions;
      setMyMissionsList(getStructuredMissions(missions));
    } catch (error) {
      console.error("Error fetching missions:", error);
    }
  };

  useEffect(() => {
    setToday(getdate());
  }, []);

  useEffect(() => {
    fetchEvents();
  
    fetchMissions();
  }, []);

  // Personnalisation de l'apparence des événements
  const eventPropGetter = (event) => {
    let className = '';

    if (myMissionsList.some(e => e.title === event.title && e.start.getTime() === event.start.getTime())) {
      className = 'entry-mission';
    } else if (myEventsList.some(e => e.title === event.title && e.start.getTime() === event.start.getTime())) {
      className = 'entry-event';
    } else if (myStepsList.some(e => e.title === event.title && e.start.getTime() === event.start.getTime())) {
      className = 'entry-step';
    } else if (myProjetsList.some(e => e.title === event.title && e.start.getTime() === event.start.getTime())) {
      className = 'entry-project';
    }

    return { className };
  };

  return (
    <div className="home-content">
      <div className="today">
      <p className="today-text" style={{ color: 'white' }}>{today}</p>
      </div>
      <Calendar
        localizer={localizer}
        events={[
          ...myEventsList,
          ...myStepsList,
          ...myMissionsList,
          ...myProjetsList,
        ]}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        eventPropGetter={eventPropGetter}
      />
    </div>
  );
};

export default MyCalendar;
