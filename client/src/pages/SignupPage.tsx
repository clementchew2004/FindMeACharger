import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function SignupPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isPending, setIsPending] = useState(false);
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message: string; }>({
    type: "idle",
    message: "",
  });

  const ERROR_MESSAGES: Record<string, string> = {
    USER_ALREADY_EXISTS: t("signup.error.userExists"),
    EMAIL_ALREADY_EXISTS: t("signup.error.userExists"),
    INVALID_EMAIL: t("signup.error.invalidEmail"),
    WEAK_PASSWORD: t("signup.error.weakPassword"),
    TOO_MANY_REQUESTS: t("login.error.tooManyRequests"),
  };

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

    if (form.password !== form.confirmPassword) {
      return setStatus({ type: "error", message: t("signup.error.passwordsMatch") });
    }

    await authClient.signUp.email({
      email: form.email.trim(),
      password: form.password,
      name: form.username.trim(),
      ...(form.displayName && { publicName: form.displayName.trim() }),
    }, {
      onRequest: () => {
        setIsPending(true);
        setStatus({ type: "idle", message: "" });
      },
      onSuccess: () => {
        setStatus({
          type: "success",
          message: t("signup.success"),
        });
        setIsPending(false);
      },
      onError: (ctx) => {
        const message = ERROR_MESSAGES[ctx.error.code] || ctx.error.message || t("login.error.generic");
        setStatus({ type: "error", message });
        setIsPending(false);
      },
    });
  };

  return (
    <div className="app-container">
      <h1>{t("signup.title")}</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
        <div className="inputs">
          <input name="username" placeholder={t("signup.username")} value={form.username} onChange={handleChange} required disabled={isPending} />
          <input name="displayName" placeholder={t("signup.displayName")} value={form.displayName} onChange={handleChange} disabled={isPending} />
          <input name="email" placeholder={t("signup.email")} type="email" value={form.email} onChange={handleChange} required disabled={isPending} />
          <input name="password" placeholder={t("signup.password")} type="password" value={form.password} onChange={handleChange} required minLength={12} disabled={isPending} />
          <input name="confirmPassword" placeholder={t("signup.confirmPassword")} type="password" value={form.confirmPassword} onChange={handleChange} required disabled={isPending} />
        </div>

        {status.message && (
          <p style={{ color: status.type === "error" ? "red" : "green", fontSize: "0.875rem", margin: "10px 0", textAlign: "center" }}>
            {status.message}
          </p>
        )}

        <div>
          <button type="submit" disabled={isPending}>
            {isPending ? t("signup.creatingAccount") : t("signup.button")}
          </button>
          <button type="button" onClick={() => navigate("/")} disabled={isPending}>
            {t("signup.backToLogin")}
          </button>
        </div>
      </form>
    </div>
  );
}