import { useEffect, useState } from "react";
import "./edit_user.css";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const EditUser = () => {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState(""); // Assuming 'status' should be used for something
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [actual_password,setApassword]=useState("");
  const [skills, setSkills] = useState("");

  let navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setName(localStorage.getItem('name') || "");
    setEmail(localStorage.getItem('email') || "");
    setId(localStorage.getItem('id') || "");
    setStatus(localStorage.getItem('status') || "");
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!id) {
      console.error("User ID is missing");
      return;
    }

    const token = localStorage.getItem('token');
    const data = {
      name,
      email,
      password,
      actual_password
    };

    const config = {
      method: "patch",
      url: `https://projet-annuel-q1r6.onrender.com/admins/${id}`,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      data: JSON.stringify(data)
    };

    axios
      .request(config)
      .then(() => {
        localStorage.setItem('name', name);
        localStorage.setItem('email', email);
        localStorage.setItem('skills', skills);

        navigate('/');
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className="container row edit-wrap">
      <div className="profile-left">
        <div className="profile-image">
          <img src="/image/logo-avatar.png" alt="Profile Image" />
        </div>
        <div>
          <table>
            <tbody>
              <tr key="name"><td style={{ fontSize: "40px", color: "orange" }}>{localStorage.getItem('name')}</td></tr>
              <tr key="status"><td>{localStorage.getItem('status')}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="profile-right">
        <h1 className="signin-right-title">Edit Profile</h1>

        <form className="formGroup edit-center" onSubmit={handleSubmit}>
          <div className="inputGroup">
            <label className="form-label mt-4" htmlFor="name">Name</label>
            <input
              id="name"
              aria-label="Enter Name"
              className="form-control"
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="inputGroup">
            <label className="form-label mt-4" htmlFor="email">Email</label>
            <input
              id="email"
              aria-label="Enter Email"
              className="form-control"
              type="email"
              name="email"
              value={email}
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
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
              placeholder="Enter a new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="inputGroup">
            <label className="form-label mt-4" htmlFor="actual_password" style={{ color: "red" }}>Actual password</label>
            <input
              id="actual_password"
              aria-label="Enter Actual Password"
              className="form-control"
              type="password"
              name="actual_password"
              placeholder="Enter your actual password"
              value={actual_password}
              onChange={(e) => setApassword(e.target.value)}
              required
            />
          </div>
          <div className="form-footer">
            <input
              className="submitButton"
              type="submit"
              aria-label="Submit"
            />
          </div>
          <br />
        </form>
      </div>
    </div>
  );
};

export default EditUser;
