import { useEffect, useState } from "react";
import "./signin.css";
import logo from "/image/logo.png";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { toast } from "react-toastify";

const LogInAdmin = () => {

  const text = "Companion";
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate("/home");
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
      }, 3000);
    }

    return () => clearTimeout(timeout);
  }, [index, text]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const VITE_URL_API = import.meta.env.VITE_URL_API;
  let navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    let data = { email, password };
    data = JSON.stringify(data);
  
    console.log("Sending request with data:", data);
  
    axios.post(`${VITE_URL_API}/login`, data, {
      headers: { 'Content-Type': 'application/json' }
    })
    .then((response) => {
      console.log("Login successful, API response:", response);
  
      if (response.status === 200) {
        setEmail("");
        setPassword("");
        toast.success("Connecté avec succès");
  
        // Stocker les informations dans localStorage
        localStorage.setItem('token', response.data.token);
  
        // Extraire les informations de l'utilisateur
        const user = response.data.user;
        localStorage.setItem('name', user.name);
        localStorage.setItem('id', user.id);
  
        // Vérification du rôle de l'utilisateur via `status.type`
        if (user.status && user.status.type === 'ADMIN') {
          setTimeout(() => {
            navigate("/admin_home");  // Redirection vers la page admin
          }, 3000);
        } else {
          setTimeout(() => {
            navigate("/home");  // Redirection vers la page standard
          }, 3000);
        }
      }
    })
    .catch((error) => {
      console.error("API error:", error);  // Log en cas d'erreur
      const errorMessage = error.response?.data?.message || 'Une erreur s\'est produite';
      toast.error(errorMessage);
    });
  };
  

  return (
    <div className="container signin row">
      <div className="signin-left col">
        <div className="title-signin">{displayedText}</div>
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
            <input
              className="submitButton"
              type="submit"
              aria-label="Se connecter" />
          </div><br />
        </form>
      </div>
    </div>
  );
}

export default LogInAdmin;
