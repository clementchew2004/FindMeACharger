import { BrowserRouter, Route, Routes } from "react-router-dom";
import './App.css';
import LoginPage from "./pages/LoginPage";
import MapRoutingPage from "./pages/MapRoutingPage";
import SignupPage from "./pages/SignupPage";

function App() {
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
