import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AUTH_SERVER_BASE_URL } from "@/lib/auth-client";

type VerificationState = {
  loading: boolean;
  success: boolean;
  message: string;
};

function getErrorMessage(errorCode?: string) {
  switch (errorCode) {
    case "TOKEN_EXPIRED":
      return "This verification link has expired. Please request a new email and try again.";
    case "INVALID_TOKEN":
      return "This verification link is invalid. Please use the latest link from your inbox.";
    case "USER_NOT_FOUND":
      return "We couldn't find an account for this link.";
    case "INVALID_USER":
      return "This verification link doesn't match your account. Please sign in and try again.";
    default:
      return "We couldn't verify your email with this link. It may be invalid or already used.";
  }
}

function getApiErrorCode(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  if ("code" in payload && typeof payload.code === "string") {
    return payload.code;
  }

  if (
    "error" in payload &&
    payload.error &&
    typeof payload.error === "object" &&
    "code" in payload.error &&
    typeof payload.error.code === "string"
  ) {
    return payload.error.code;
  }

  return undefined;
}

export function EmailVerificationPage() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const [state, setState] = useState<VerificationState>({
    loading: true,
    success: false,
    message: "We're verifying your email address...",
  });

  useEffect(() => {
    const error = params.get("error") ?? undefined;
    const verified = params.get("verified");
    const token = params.get("token");

    if (error) {
      setState({
        loading: false,
        success: false,
        message: getErrorMessage(error),
      });
      return;
    }

    if (verified === "1") {
      setState({
        loading: false,
        success: true,
        message: "Your email has been verified. You can now sign in.",
      });
      return;
    }

    if (!token) {
      setState({
        loading: false,
        success: false,
        message: "This verification link is incomplete. Please open the full link from your email.",
      });
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `${AUTH_SERVER_BASE_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (response.ok) {
          setState({
            loading: false,
            success: true,
            message: "Your email has been verified. You can now sign in.",
          });
          return;
        }

        const payload = (await response
          .json()
          .catch(() => null)) as unknown;
        const errorCode = getApiErrorCode(payload);
        setState({
          loading: false,
          success: false,
          message: getErrorMessage(errorCode),
        });
      } catch {
        setState({
          loading: false,
          success: false,
          message:
            "We couldn't connect right now. Please try again in a moment.",
        });
      }
    };

    verifyEmail();
  }, [params]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-8 p-6 md:p-10">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
          <CardDescription>
            {state.loading
              ? "Please wait while we check your link."
              : state.success
                ? "You're all set"
                : "We couldn't verify your email"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p
            aria-live="polite"
            className={state.success ? "text-green-700" : "text-destructive"}
          >
            {state.message}
          </p>
          <Button type="button" onClick={() => (window.location.href = "/")}>
            Back to sign in
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}