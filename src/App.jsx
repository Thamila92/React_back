import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Home from './pages/Home';
import Vote from './pages/Vote';
import Votee from './pages/Votee';
import Document from './pages/Document/index.jsx';
import Header from './components/Header';
import Footer from './components/Footer';
import LogIn from './pages/Login/index.jsx';
import LogInBenefactor from './pages/Login/Benefactor.jsx';
import LogInAdmin from './pages/Login/Admin.jsx';
import SignUp from './pages/Register/index.jsx';
import SignUpBenefactor from './pages/Register/indexbenefactor.jsx';
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
import EditUser from './pages/Edit_user/index.jsx';
import NotificationTable from './pages/Invitation/invitation.jsx';
import Admin_membergestion from "./pages/Admin_membergestion";
import Planning from "./pages/Planning";
import MyCalendar from "./pages/MyCalendar";
import Notification from "./pages/Notifications";
import Result from "./pages/Result";
import Faq from './pages/Faq/index.jsx';


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


          <Route path="/Benefactor" element={<LogInBenefactor />} />
          <Route path="/Benefactor/SignUp" element={<SignUpBenefactor />} />


          <Route path="/Admin" element={<LogInAdmin />} />
          <Route path="/Admin/SignUp" element={<SignUpAdmin />} />

          <Route element={<HeaderLayout />}>
            <Route path="/Expenditure" element={<Expenditure />} />
            <Route path="/Donation" element={<Donation />} />


            <Route path="/Document" element={<Document />} />

            <Route path="/home" element={<Home />} />

            <Route path="/admin_vote" element={<Vote />} />
            <Route path="/vote" element={<Votee />} />

            <Route path="/payment" element={<Payment/>}/>

            <Route path="/admin_home" element={<Admin_home/>}/>
            <Route path="/admin_file" element={<Admin_file/>}/>


            <Route path="/edit_user" element={<EditUser/>}/>
            <Route path="/notifications" element={<NotificationTable/>}/>
            <Route path="/home" element={<Home />} />
            <Route path="/result" element={<Result/>}/>
            <Route path="/admin_membergestion" element={<Admin_membergestion/>}/>
            <Route path="/planning" element={<Planning/>}/>
            <Route path="/faq" element={<Faq/>}/>
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
