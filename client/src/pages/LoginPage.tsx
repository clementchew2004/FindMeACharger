import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authClient } from "../lib/auth-client";

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: "Incorrect email or password.",
  INVALID_EMAIL_OR_PASSWORD: "Incorrect email or password.",
  TOO_MANY_REQUESTS: "Too many attempts. Please try again later.",
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const rememberMe = formData.get("remember-me") === "on";

    await authClient.signIn.email({
      email,
      password,
      rememberMe,
    }, {
      onRequest: () => {
        setLoading(true);
        setErrorMessage(null);
      },
      onSuccess: () => {
        navigate("/routing");
      },
      onError: (ctx: any) => {
        const code = ctx.error.code;
        setErrorMessage(ERROR_MESSAGES[code] || "Something went wrong. Please try again.");
      },
      onResponse: () => {
        setLoading(false);
      }
    });
  };

  return (
    <div className="app-container">
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <div className="inputs">
          <input name="email" placeholder="Email" type="email" required disabled={loading} />
          <input name="password" placeholder="Password" type="password" required disabled={loading} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between', margin: '8px 0', width: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input id="remember-me" name="remember-me" type="checkbox" disabled={loading} style={{ width: 'auto', margin: 0 }} />
              <label htmlFor="remember-me">Remember me</label>
            </div>
            <button type="submit" disabled={loading} style={{ width: 'auto', margin: 0 }}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </div>

        {errorMessage && (
          <p style={{ color: "red", textAlign: "center" }}>{errorMessage}</p>
        )}

        <div style={{ width: "300px", marginTop: "10px" }}>
          <button
            type="button"
            onClick={() => navigate("/routing")}
            disabled={loading}
            style={{ width: "100%" }}
          >
            Go to map page without login (for development)
          </button>
        </div>

        <div style={{ width: "300px", marginTop: "10px" }}>
          <button
            type="button"
            onClick={() => navigate("/manage-points")}
            disabled={loading}
            style={{ width: "100%" }}
          >
            Go to operator manage points page without login (for development)
          </button>
        </div>

      </form>

      <p>
        Don't have an account? <button type="button" onClick={() => navigate("/signup")} disabled={loading}>Sign up</button>
      </p>
    </div>
  );
}