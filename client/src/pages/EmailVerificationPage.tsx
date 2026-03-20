import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function EmailVerificationPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const token = params.get("token");

    if (!token) {
      setError("Missing verification token.");
      setIsVerifying(false);
      return;
    }

    authClient.verifyEmail({
      query: { token },
    }, {
      onRequest: () => setIsVerifying(true),
      onSuccess: () => {
        setIsVerifying(false);
        // auto sign in is enabled so user will have valid auth cookie
        setTimeout(() => navigate("/routing"), 2000);
      },
      onError: (ctx) => {
        setIsVerifying(false);
        setError(ctx.error.message || "Verification failed.");
      }
    });
  }, [params, navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Email Verification</CardTitle>
          <CardDescription>
            {isVerifying ? "Checking your credentials..." : error ? "Verification Failed" : "Success!"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 py-6">
          {isVerifying && <Loader2 className="h-10 w-10 animate-spin text-primary" />}

          {!isVerifying && !error && (
            <div className="flex flex-col items-center gap-2 text-green-600">
              <CheckCircle2 className="h-10 w-10" />
              <p className="font-medium text-center">Your email is verified. Taking you home...</p>
            </div>
          )}

          {!isVerifying && error && (
            <div className="flex flex-col items-center gap-2 text-destructive">
              <XCircle className="h-10 w-10" />
              <p className="font-medium text-center">{error}</p>
              <Button variant="outline" className="mt-2" onClick={() => navigate("/")}>
                Return to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}