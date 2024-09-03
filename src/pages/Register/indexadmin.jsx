import { useEffect, useState } from "react"
import "./signin.css"
import logo from "/image/logo.png"
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { toast } from "react-toastify";
// import api from '.../api';

const SignUpAdmin = () => {const text = "Companion";
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let timeout;
    if (index < text.length) {
      timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text.charAt(index));
        setIndex(index + 1);
      }, 300); // Adjust delay here (in milliseconds)
    } else {
      // Reset after completion
      timeout = setTimeout(() => {
        setDisplayedText('');
        setIndex(0);
      }, 3000); // Delay before restarting (in milliseconds)
    }

    return () => clearTimeout(timeout); // Cleanup timeout on component unmount or before the next run
  }, [index, text]);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [password, setPassword] = useState("");

  const VITE_URL_API = import.meta.env.VITE_URL_API;

  let navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    let data = { email, password , name,key}
    data = JSON.stringify(data);

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${VITE_URL_API}/admin/signup`,
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    axios.request(config)
        .then((response) => {
            if (response.status >=200 && response.status <300 ) {
                console.log(response.data);
                setEmail("");
                setName("");
                setPassword("");
                toast.success("Connecté");
                setTimeout(() => {
                    navigate("/");
                }, 3000);
            }
        })
        .catch((error) => {
            const errorMessage = error.response?.data?.message ||
            'An error occurred';
            toast.error(errorMessage);
        });
  }

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
      <h1 className="signin-right-title">Registration</h1>

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
                        onChange={(e) => {
                            setEmail(e.target.value);
                        }}
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
                        onChange={(e) => {
                            setPassword(e.target.value);
                        }}
                        required="required"
                    />
                </div>
                <div className="inputGroup">
                    <label className="form-label mt-4" htmlFor="name">Name</label>
                    <input
                        id="name"
                        aria-label="Enter Name"
                        className="form-control"
                        type="text"
                        name="name"
                        placeholder="Enter Name"
                        onChange={(e) => {
                            setName(e.target.value);
                        }}
                        required="required"
                    />
                </div>
                <div className="inputGroup">
                    <label className="form-label mt-4" htmlFor="key">Key</label>
                    <input
                        id="key"
                        aria-label="Enter Key"
                        className="form-control"
                        type="text"
                        name="key"
                        placeholder="Enter Key"
                        onChange={(e) => {
                            setKey(e.target.value);
                        }}
                        required="required"
                    />
                </div>
                <div className="form-footer">
                    <input
                        className="submitButton"
                        type="submit"
                        aria-label="Register" />
                </div>
            </form >
      </div>
    </div>
  )
}

export default SignUpAdmin
