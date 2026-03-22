import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { authClient } from "../lib/auth-client";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function LoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const ERROR_MESSAGES: Record<string, string> = {
    INVALID_CREDENTIALS: t("login.error.invalidCredentials"),
    INVALID_EMAIL_OR_PASSWORD: t("login.error.invalidCredentials"),
    TOO_MANY_REQUESTS: t("login.error.tooManyRequests"),
  };

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
        setErrorMessage(ERROR_MESSAGES[code] || t("login.error.generic"));
      },
      onResponse: () => {
        setLoading(false);
      }
    });
  };

  return (
    <div className="app-container">
      <h1>{t("login.title")}</h1>

      <form onSubmit={handleSubmit}>
        <div className="inputs">
          <input name="email" placeholder={t("login.email")} type="email" required disabled={loading} />
          <input name="password" placeholder={t("login.password")} type="password" required disabled={loading} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between', margin: '8px 0', width: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input id="remember-me" name="remember-me" type="checkbox" disabled={loading} style={{ width: 'auto', margin: 0 }} />
              <label htmlFor="remember-me">{t("login.rememberMe")}</label>
            </div>
            <button type="submit" disabled={loading} style={{ width: 'auto', margin: 0 }}>
              {loading ? t("login.loggingIn") : t("login.button")}
            </button>
          </div>
        </div>

        {errorMessage && (
          <p style={{ color: "red", textAlign: "center" }}>{errorMessage}</p>
        )}

        <div style={{ display: "flex", width: '100%' }}>
          <button type="button" onClick={() => navigate("/routing")} disabled={loading} style={{ width: '100%' }}>
            {t("login.continueWithoutLogin")}
          </button>
        </div>
      </form>

      <p>
        {t("login.noAccount")} <button type="button" onClick={() => navigate("/signup")} disabled={loading}>{t("login.signUp")}</button>
      </p>

      <div style={{ position: 'fixed', bottom: '12px', right: '12px' }}>
        <LanguageSwitcher />
      </div>
    </div>
  );
}