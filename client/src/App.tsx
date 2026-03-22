import { BrowserRouter, Route, Routes } from "react-router-dom";
import './App.css';
import LoginPage from "./pages/LoginPage";
import MapRoutingPage from "./pages/MapRoutingPage";
import ReportPage from "./pages/ReportPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";
import OperatorDashboardPage from "./pages/OperatorDashboardPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />}></Route>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/routing" element={<MapRoutingPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/manage-points" element={<OperatorDashboardPage />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
