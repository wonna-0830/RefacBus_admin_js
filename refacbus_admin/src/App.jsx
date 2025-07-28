import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from "./pages/Login"
import Home from "./pages/Home"
import Register from "./pages/Register"
import UserManagement from './pages/UserManagement';
import PlaceTimeManagement from './pages/PlaceTimeManagement';
import ReservationManagement from './pages/ReservationManagement';
import DriverManagement from './pages/DriverManagement.jsx';
import ManagerManagement from './pages/ManagerManagement.jsx';
import DashBoard from './pages/DashBoard.jsx';

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Register" element={<Register />}/>
        <Route path="/Home" element={<Home />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/placetime-management" element={<PlaceTimeManagement />} />
        <Route path="/reservation-management" element={<ReservationManagement />} />
        <Route path="/driver-management" element={<DriverManagement />} />
        <Route path="/manager-management" element={<ManagerManagement />} />
        <Route path="/dashboard" element={<DashBoard />} />
        <Route path="/Login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
