import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ERROR_MESSAGES: Record<string, string> = {
  USER_ALREADY_EXISTS: "An account with this email already exists.",
  EMAIL_ALREADY_EXISTS: "An account with this email already exists.",
  INVALID_EMAIL: "Please enter a valid email address.",
  WEAK_PASSWORD: "Password must be at least 12 characters.",
  TOO_MANY_REQUESTS: "Too many attempts. Please try again later.",
};

export default function SignupPage() {
  const navigate = useNavigate();
  const [isPending, setIsPending] = useState(false);
  const [status, setStatus] = useState<{
    type: "idle" | "success" | "error";
    message: string;
  }>({
    type: "idle",
    message: "",
  });

  const [form, setForm] = useState({
    username: "",
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Frontend password mismatch validation
    if (form.password !== form.confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    await authClient.signUp.email(
      {
        email: form.email.trim(),
        password: form.password,
        name: form.username.trim(),
        ...(form.displayName && { publicName: form.displayName.trim() }),
      },
      {
        onRequest: () => {
          setIsPending(true);
          setStatus({ type: "idle", message: "" });
        },
        onSuccess: () => {
          setStatus({
            type: "success",
            message: "Account created! Check your email for a verification link.",
          });
          setIsPending(false);
        },
        onError: (ctx) => {
          const message =
            ERROR_MESSAGES[ctx.error.code] || ctx.error.message || "An unexpected error occurred.";
          setStatus({ type: "error", message });
          setIsPending(false);
        },
      }
    );
  };

  return (
    <div className="app-container">
      <h1>Sign Up</h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center" }}
      >
        <div className="inputs">
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
            disabled={isPending}
          />
          <input
            name="displayName"
            placeholder="Display Name (Optional)"
            value={form.displayName}
            onChange={handleChange}
            disabled={isPending}
          />
          <input
            name="email"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            disabled={isPending}
          />
          <input
            name="password"
            placeholder="Password (Min 12 chars)"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={12}
            disabled={isPending}
          />
          <input
            name="confirmPassword"
            placeholder="Confirm Password"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            disabled={isPending}
          />
        </div>

        {status.message && (
          <p
            style={{
              color: status.type === "error" ? "red" : "green",
              fontSize: "0.875rem",
              margin: "10px 0",
              textAlign: "center",
            }}
          >
            {status.message}
          </p>
        )}

        <div>
          <button type="submit" disabled={isPending}>
            {isPending ? "Creating account..." : "Sign up"}
          </button>
          <button type="button" onClick={() => navigate("/")} disabled={isPending}>
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
}