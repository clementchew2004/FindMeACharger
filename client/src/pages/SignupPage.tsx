import { useNavigate } from "react-router-dom";

export default function SignupPage() {
  const navigate = useNavigate();

  return (
    <div className="app-container">
      <h1>Sign Up</h1>

      <div className="inputs">
        <input placeholder="Email" type="email"/>
        <input placeholder="Password" type="password"/>
      </div>

      <div>
        <button onClick={() => navigate("/")}>Sign up</button>
        <button onClick={() => navigate("/")}>Back to Login</button>
      </div>
    </div>
  );
}