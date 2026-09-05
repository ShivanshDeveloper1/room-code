import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import Allmain from "./components/Allmain";
import ForgetPassword from "./Pages/ForgetPassword";
function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
           <Route path="/newpassword/:token" element={<ForgetPassword />} />
          <Route path="*" element={<Allmain />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
