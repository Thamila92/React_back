import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Home from './pages/Home';
import VoteSession from './pages/Vote';
import VotingSystem from './pages/Votee';
import Document from './pages/Document/index.jsx';
import Header from './components/Header';
import Footer from './components/Footer';
import LogIn from './pages/Login/index.jsx';
 import SignUp from './pages/Register/index.jsx';
 import SignUpAdmin from './pages/Register/indexadmin.jsx';
import Aside from './components/Aside';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ChatbotComponent from './components/chatbot/ChatbotComponent.jsx';
import Expenditure from './pages/Expenditure/index.jsx';
import Payment from "./pages/Payment";
import Admin_file from "./pages/Admin_file";
import Admin_home from "./pages/Admin_home";
import Donation from './pages/Donation/index.jsx';
import Profile from './pages/Edit_user/index.jsx';
import NotificationTable from './pages/Invitation/invitation.jsx';
import Admin_membergestion from "./pages/Admin_membergestion";
import Planning from "./pages/Planning";
import MyCalendar from "./pages/MyCalendar";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard.tsx";
import Demandes from "./pages/Demande/demande.tsx";
import Missions from "./pages/Mission/mission.tsx";
import Result from "./pages/Result";
import Faq from "./pages/Faq";
import Users from "./pages/Users/users.tsx"


const HeaderLayout = () => {
  return (
    <div className="layout">
      <Aside />
      <div className="main-content">
        <Header />
        <div className="content">
          <Outlet />
        </div>
        <Footer />
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>

      <div className="App">
        <ChatbotComponent />
        <Routes>
          <Route path="/" element={<LogIn />} />
          <Route path="/SignUp" element={<SignUp />} />
 


 


           <Route path="/Admin/SignUp" element={<SignUpAdmin />} />

          <Route element={<HeaderLayout />}>
            <Route path="/Expenditure" element={<Expenditure />} />
            <Route path="/Donation" element={<Donation />} />


            <Route path="/Document" element={<Document />} />

            <Route path="/home" element={<Home />} />

            <Route path="/admin_vote" element={<VoteSession />} />
            <Route path="/vote" element={<VotingSystem />} />

            <Route path="/payment" element={<Payment/>}/>

            <Route path="/admin_home" element={<Admin_home/>}/>
            <Route path="/admin_file" element={<Admin_file/>}/>


            <Route path="/edit_user" element={<Profile/>}/>
            <Route path="/faq" element={<Faq/>}/>
            <Route path="/notifications" element={<NotificationTable/>}/>
            <Route path="/home" element={<Home />} />
            <Route path="/result" element={<Result/>}/>
            <Route path="/admin_membergestion" element={<Admin_membergestion/>}/>
            <Route path="/planning" element={<Planning/>}/>
            <Route path="/faq" element={<Faq/>}/>
            <Route path="/users" element={<Users/>}/>
            <Route path="/demandes" element={<Demandes/>}/>
            <Route path="/missions" element={<Missions />} />  
            <Route path="/dashboard" element={<AdminDashboard />} />  

            
{/* //             <Route path="/edit_user" element={<Edit_user/>}/> */}
            <Route path="/mycalendar" element={<MyCalendar/>}/>
{/* //             <Route path="/notification" element={<Notification/>}/> */}
          </Route>
      </Routes>
      <ToastContainer
        position="top-center"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
    </Router>
  );
}

export default App;
