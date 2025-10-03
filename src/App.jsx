// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import Login from './pages/LoginPage.jsx';
import Ticketgenerate from './pages/Ticketgenerate';
import ViewTickets from './pages/ViewTickets';
import UpdateProfile from './pages/UpdateProfile';
import SystemSettings from './pages/SystemSettings';
import ManageTickets from './pages/ManageTickets';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/welcome/generate" element={<Ticketgenerate />}/>
        <Route path="/welcome/ViewTickets" element={<ViewTickets />}/>
        <Route path="/welcome/UpdateProfile" element={<UpdateProfile />}/>
        <Route path="/welcome/SystemSettings" element={<SystemSettings />}/>
        <Route path="/welcome/ManageTickets" element={<ManageTickets />}/>
      </Routes>
    </Router>
  );
};

export default App;
