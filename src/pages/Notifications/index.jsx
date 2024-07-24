import { useState, useEffect } from "react";
import getdate from "../../utils/getDate.js";
import "./notifications.css"
import axios from "axios";
import Notification_card from "../../components/Notification_card";

const Notifications = () => {
  const [today, setToday] = useState();
  const [notifications, setNotifications] = useState();

  useEffect(() => {
    setToday(getdate());
  }, []);

  const API_URL = import.meta.env.VITE_URL_API;

  useEffect(() => {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: API_URL + "/notifications",
        headers: {
            'Content-Type': 'application/json'
        },
    };

    // Utilisation d'axios pour effectuer la requête HTTP.
    axios.request(config)
        .then((response) => {
            console.log(response);
            // Mise à jour de la variable d'état workshops avec les données reçues de la requête.
            setNotifications(response.data.notifications);
        })
        .catch((error) => {
            console.log(error);
        });

}, []);

  return (
    <div className="notification-body">
    <div className="today">
      <p className="today-text">{today}</p>
    </div>
    {notifications && notifications.map((notification)=>(
      <Notification_card key={notification.id} notification={notification}/>
    ))}
    </div>
  )
}

export default Notifications
