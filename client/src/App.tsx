import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import EmailVerificationPage from "./pages/EmailVerificationPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MapRoutingPage from "./pages/MapRoutingPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />}></Route>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/routing" element={<MapRoutingPage />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        <Route path="/api/auth/verify-email" element={<EmailVerificationPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
