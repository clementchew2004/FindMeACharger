import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

type SignupFormProps = React.ComponentProps<typeof Card> & {
  onSwitchToLogin?: () => void;
};

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    if ("code" in error && typeof error.code === "string") {
      switch (error.code) {
        case "USER_ALREADY_EXISTS":
        case "EMAIL_ALREADY_EXISTS":
          return "An account with this email already exists. Please sign in or use a different email.";
        case "INVALID_EMAIL":
          return "Please enter a valid email address.";
        case "WEAK_PASSWORD":
          return "Choose a stronger password with at least 12 characters.";
        case "TOO_MANY_REQUESTS":
          return "Too many attempts. Please wait a moment and try again.";
        default:
          break;
      }
    }

    if ("message" in error && typeof error.message === "string") {
      const message = error.message.toLowerCase();
      if (message.includes("already") && message.includes("exist")) {
        return "An account with this email already exists. Please sign in or use a different email.";
      }

      if (message.includes("password") && message.includes("weak")) {
        return "Choose a stronger password with at least 12 characters.";
      }

      if (message.includes("email") && message.includes("invalid")) {
        return "Please enter a valid email address.";
      }
    }
  }

  return "We couldn't create your account right now. Please try again.";
}

export function SignupForm({ onSwitchToLogin, ...props }: SignupFormProps) {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    type: "idle" | "success" | "error";
    message: string;
  }>({
    type: "idle",
    message: "",
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus({ type: "idle", message: "" });

    if (password !== confirmPassword) {
      setStatus({
        type: "error",
        message: "Passwords do not match.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const callbackURL = `${window.location.origin}/verify-email?verified=1`;

      const signupPayload = {
        name: username.trim(),
        email: email.trim(),
        password,
        callbackURL,
      } as Record<string, string>;

      const normalizedDisplayName = displayName.trim();
      if (normalizedDisplayName) {
        signupPayload.publicName = normalizedDisplayName;
      }

      const response = await authClient.signUp.email(
        signupPayload as unknown as Parameters<typeof authClient.signUp.email>[0]
      );

      if (response.error) {
        setStatus({
          type: "error",
          message: getErrorMessage(response.error),
        });
        return;
      }

      setStatus({
        type: "success",
        message:
          "Account created. Check your inbox to verify your email before signing in.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: getErrorMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your details to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                disabled={isSubmitting}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="display-name">Display Name</FieldLabel>
              <Input
                id="display-name"
                type="text"
                placeholder="John Doe"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                autoComplete="name"
                disabled={isSubmitting}
              />
              <FieldDescription>
                Optional. If provided, this name will be shown publicly instead of your username. You can change this later in your account settings.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                disabled={isSubmitting}
                required
              />
              <FieldDescription>
                We'll use this to contact you. Your email address won't be shared.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                disabled={isSubmitting}
                minLength={12}
                required
              />
              <FieldDescription>
                Must be at least 12 characters long.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                disabled={isSubmitting}
                minLength={12}
                required
              />
              <FieldDescription>Please confirm your password.</FieldDescription>
            </Field>
            <FieldGroup>
              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating account..." : "Create Account"}
                </Button>
                {status.type !== "idle" && (
                  <FieldDescription
                    aria-live="polite"
                    className={
                      status.type === "error" ? "text-destructive" : "text-green-700"
                    }
                  >
                    {status.message}
                  </FieldDescription>
                )}
                <FieldDescription className="px-6 text-center">
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="underline underline-offset-4 hover:text-primary"
                    onClick={onSwitchToLogin}
                    disabled={isSubmitting}
                  >
                    Sign in
                  </button>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
