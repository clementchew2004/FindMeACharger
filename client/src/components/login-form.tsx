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
import { cn } from "@/lib/utils";
import { useState } from "react";

type LoginFormProps = React.ComponentProps<"div"> & {
  onSwitchToSignup?: () => void;
};

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    if ("code" in error && typeof error.code === "string") {
      switch (error.code) {
        case "INVALID_CREDENTIALS":
        case "INVALID_EMAIL_OR_PASSWORD":
          return "Incorrect email or password. Please try again.";
        case "EMAIL_NOT_VERIFIED":
          return "Please verify your email address before signing in.";
        case "TOO_MANY_REQUESTS":
          return "Too many attempts. Please wait a moment and try again.";
        default:
          break;
      }
    }

    if ("message" in error && typeof error.message === "string") {
      const message = error.message.toLowerCase();
      if (
        message.includes("invalid") ||
        message.includes("credential") ||
        message.includes("password")
      ) {
        return "Incorrect email or password. Please try again.";
      }

      if (message.includes("verify") && message.includes("email")) {
        return "Please verify your email address before signing in.";
      }
    }
  }

  return "We couldn't sign you in right now. Please try again.";
}

export function LoginForm({
  onSwitchToSignup,
  className,
  ...props
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
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
    setIsSubmitting(true);

    try {
      const response = await authClient.signIn.email({
        email: email.trim(),
        password,
        rememberMe,
      });

      if (response.error) {
        setStatus({
          type: "error",
          message: getErrorMessage(response.error),
        });
        return;
      }

      setStatus({
        type: "success",
        message: "You're signed in. Redirecting...",
      });
    } catch (error) {
      setStatus({ type: "error", message: getErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your details to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="m@example.com"
                  autoComplete="email"
                  disabled={isSubmitting}
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  required
                />
              </Field>
              <Field orientation="horizontal" className="items-center gap-2">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-input"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  disabled={isSubmitting}
                />
                <FieldLabel htmlFor="remember-me">Remember me</FieldLabel>
              </Field>
              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Logging in..." : "Login"}
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
                <FieldDescription className="text-center">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="underline underline-offset-4 hover:text-primary"
                    onClick={onSwitchToSignup}
                    disabled={isSubmitting}
                  >
                    Sign up
                  </button>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
