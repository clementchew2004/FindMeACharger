import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="app-container">
      <h1>Login</h1>

      <div className="inputs">
        <input placeholder="Email" type="email"/>
        <input placeholder="Password" type="password"/>
      </div>

      <div>
        <button onClick={() => navigate("/main")}>Login</button>
        <button onClick={() => navigate("/main")}>Continue without login (for development)</button>
      </div>

      <p>
        Don't have an account? <button onClick={() => navigate("/signup")}>Sign up</button>
      </p>
    </div>
  );
}