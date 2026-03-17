import { createAuthClient } from "better-auth/react";

export const AUTH_SERVER_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const authClient = createAuthClient({
  baseURL: AUTH_SERVER_BASE_URL,
  fetchOptions: {
    credentials: "include",
  },
});
