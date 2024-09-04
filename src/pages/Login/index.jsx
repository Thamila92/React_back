import { useEffect, useState } from "react";
import "./signin.css";
import logo from "/image/logo.png";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { toast } from "react-toastify";



import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

const LogIn = () => {
  const text = "Companion";
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const VITE_URL_API = import.meta.env.VITE_URL_API;
  let navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const statusType = localStorage.getItem('statusType');
      if (statusType === 'ADMIN') {
        navigate("/home");
      } else {
        navigate("/missions");
      }
    }
    let timeout;
    if (index < text.length) {
      timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text.charAt(index));
        setIndex(index + 1);
      }, 300); // Adjust delay here (in milliseconds)
    } else {
      timeout = setTimeout(() => {
        setDisplayedText('');
        setIndex(0);
      }, 3000); // Delay before restarting (in milliseconds)
    }

    return () => clearTimeout(timeout); // Cleanup timeout on component unmount or before the next run
  }, [index, text, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    let data = { email, password };
    data = JSON.stringify(data);
  
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${VITE_URL_API}/login`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    };
  
    axios.request(config)
      .then((response) => {
        if (response.status === 200) {
          const userData = response.data.user;
          const token = response.data.token;
      // Vérifier si l'utilisateur est banni
      if (userData.isBanned) {
        toast.error("Votre compte a été désactivé. Veuillez contacter l'administration.");
        return;  // Stop the process here if the user is banned
      }
          // Stocker les données dans localStorage
          localStorage.setItem('token', token);
          localStorage.setItem('userId', userData.id);
          localStorage.setItem('email', userData.email);
          localStorage.setItem('name', userData.name);
          localStorage.setItem('statusType', userData.status.type); // Stocker le type de statut (ADMIN, SALARIER, etc.)
  
          setEmail("");
          setPassword("");
          toast.success("Connected");
  
          // Redirection en fonction du statut de l'utilisateur
          setTimeout(() => {
            if (userData.status.type === 'ADMIN') {
              navigate("/home");
            } else {
              navigate("/missions");
            }
          }, 1000);
        }
      })
      .catch((error) => {
        if (error.response) {
          // If the error response is from the server (like 400 or 401)
          if (error.response.status === 401) {
            toast.error("Incorrect email or password");
          } else if (error.response.status === 404) {
            toast.error("User not found");
          } else {
            toast.error("An error occurred. Please try again.");
          }
        } else {
          // If there is a network error or no response
          toast.error("Unable to connect to the server. Please check your network.");
        }
      });
  };
  

  return (
    <div className="container signin row">
      <div className="signin-left col">
        <div className="title-signin">
          {displayedText}
        </div>
        <div className="title-logo">
          <img src={logo} alt="logo" />
        </div>
      </div>
      <div className="signin-right col">
        <h1 className="signin-right-title">Connexion</h1>
        <form className="formGroup" onSubmit={handleSubmit}>
          <div className="inputGroup">
            <label className="form-label mt-4" htmlFor="email">Email</label>
            <input
              id="email"
              aria-label="Enter Email"
              className="form-control"
              type="email"
              name="email"
              placeholder="Enter Email"
              onChange={(e) => setEmail(e.target.value)}
              required="required"
            />
          </div>
          <div className="inputGroup">
            <label className="form-label mt-4" htmlFor="password">Password</label>
            <input
              id="password"
              aria-label="Enter Password"
              className="form-control"
              type="password"
              name="password"
              placeholder="Enter Password"
              onChange={(e) => setPassword(e.target.value)}
              required="required"
            />
          </div>
          <div className="form-footer">
            <input className="submitButton" type="submit" aria-label="Se connecter" />
          </div><br></br>
          <div className="form-footer2">
            <Link to="/signUp">Create a new account</Link>
          </div>
          <div className="form-footer2">
            <Link to="/Admin/SignUp">Create a new account Admin</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LogIn;
