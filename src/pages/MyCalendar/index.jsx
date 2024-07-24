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
      title: `${event.typee} ${event.location[0]?.position || ''}`,
      start: getTime(event.starting),
      end: getTime(event.ending),
      allDay: false,
      resource: ""
    }));
  };

  //structurer les steps reçus
  const getStructuredSteps = (steps) => {
    return steps.map(step => ({
      title: `${step.state} ${step.location?.[0]?.position || ''}`,
      start: getTime(step.starting),
      end: getTime(step.ending),
      allDay: false,
      resource: ""
    }));
  };

   //structurer les missions reçus
   const getStructuredMissions = (missions) => {
    return missions.map(mission => ({
      title: `Mission: ${mission.description}`,
      start: getTime(mission.starting),
      end: getTime(mission.ending),
      allDay: false,
      resource:""
    }));
  };


  //structurer les projets et leurs steps reçus
  const getStructuredProjets = (projets) => {
    const structuredProjets = projets.map(projet => ({
      title: `Projet: ${projet.description}`,
      start: getTime(projet.starting),
      end: getTime(projet.ending),
      allDay: false,
      resource: ""
    }));

    const structuredSteps = projets.flatMap(projet =>
      projet.steps.map(step => ({
        title: `${step.state} - ${projet.description}: ${step.description}`,
        start: getTime(step.starting),
        end: getTime(step.ending),
        allDay: false,
        resource: ""
      }))
    );

    return [...structuredProjets, ...structuredSteps];
  };

  // Fetch des événements depuis l'API
  const fetchEvents = async () => {
    try {
      const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${API_URL}/evenements`,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      const response = await axios.request(config);
      console.log(response);
      const events = response.data.evenements;
      setMyEventsList(getStructuredEvents(events));
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch des steps depuis l'API
  const fetchSteps = async () => {
    try {
      const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${API_URL}/steps`,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      const response = await axios.request(config);
      console.log(response);
      const steps = response.data.steps;
      setMyStepsList(getStructuredSteps(steps));
    } catch (error) {
      console.log(error);
    }
  };

    // Fetch des projets depuis l'API
    const fetchProjets = async () => {
      try {
        const config = {
          method: 'get',
          maxBodyLength: Infinity,
          url: `${API_URL}/projets`,
          headers: {
            'Content-Type': 'application/json'
          }
        };
        const response = await axios.request(config);
        console.log(response);
        const projets = response.data.projets;
        setMyProjetsList(getStructuredProjets(projets));
      } catch (error) {
        console.log(error);
      }
    };

    //Fetch des Missions depuis L'API
    const fetchMissions = async () => {
      try {
        const config = {
          method: 'get',
          maxBodyLength: Infinity,
          url: `${API_URL}/missions`,
          headers: {
            'Content-Type': 'application/json'
          }
        };
        const response = await axios.request(config);
        console.log("Missions Response:", response);
        const missions = response.data.missions;
        setMyMissionsList(getStructuredMissions(missions));
      } catch (error) {
        console.log(error);
      }
    };


  useEffect(() => {
    setToday(getdate());
  }, []);

  useEffect(() => {
    fetchEvents();
    fetchSteps();
    fetchProjets();
    fetchMissions();
  }, []);

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

    return {className};
  };

  return (
    <div className="home-content">
      <div className="today">
        <p className="today-text">{today}</p>
      </div>
      <Calendar
        localizer={localizer}
        events={[...myEventsList,
          ...myStepsList,
          ...myMissionsList,
          ...myProjetsList,
          ...myEventsList
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
