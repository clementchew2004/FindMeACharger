import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import { EmailVerificationPage } from "@/components/email-verification-page";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MapRoutingPage from "./pages/MapRoutingPage";

function App() {

  // to handle links from email verification flow
  const path = window.location.pathname;
  const isVerificationRoute =
    path === "/verify-email" || path === "/api/auth/verify-email";

  if (isVerificationRoute) {
    return <EmailVerificationPage />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />}></Route>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/routing" element={<MapRoutingPage />} />
      </Routes>
    </BrowserRouter>
    
  );
}

export default App;
