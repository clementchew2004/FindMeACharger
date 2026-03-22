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
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

const API_BASE: string = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

type ReportFormProps = React.ComponentProps<"div">;

const ISSUE_TYPES = [
  "Broken / Not Working",
  "Blocked / Inaccessible",
  "Payment Issue",
  "Safety Concern",
  "Other",
];

export function ReportForm({ className, ...props }: ReportFormProps) {
  const [chargingPointId, setChargingPointId] = useState("");
  const [issueTypes, setIssueTypes] = useState<string[]>([]);
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    type: "idle" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });

  useEffect(() => {
    fetch(`${API_BASE}/api/report-types`)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error status ${res.status}`);
      return res.json();
    })
    .then((data) => {
      if (Array.isArray(data)) {
        setIssueTypes(data);
      } else if (Array.isArray(data.reportTypes)) {
        setIssueTypes(data.reportTypes);
      } else {
        setIssueTypes([]);
      }
    })
    .catch((_) => {});
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "idle", message: "" });

    try {
      const response = await fetch(`${API_BASE}/api/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chargingPointId,
          issueType,
          description,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit report");

      setStatus({
        type: "success",
        message: "Your report has been submitted. Thank you!",
      });
      setChargingPointId("");
      setIssueType("");
      setDescription("");
    } catch {
      setStatus({
        type: "error",
        message: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const navLinkStyle: React.CSSProperties = {
    position: "absolute",
    top: "10px",
    right: "10px",
    padding: "8px 20px",
    border: "none",
    borderRadius: "5px",
    backgroundColor: "#348ceb",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
    zIndex: 1000
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Report an Issue</CardTitle>
          <CardDescription>
            Let us know about a problem with a charging point
          </CardDescription>
          <NavLink
            to="/routing"
            style={{ ...navLinkStyle, margin: 0, float: "none" }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1c5fcc"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#348ceb"}
          >
            Back to map
          </NavLink>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="chargingPointId">Charging Point</FieldLabel>
                <Input
                  id="chargingPointId"
                  type="text"
                  value={chargingPointId}
                  onChange={(e) => setChargingPointId(e.target.value)}
                  placeholder="e.g. CP-001"
                  disabled={isSubmitting}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="issueType">Type of Issue</FieldLabel>
                <select
                  id="issueType"
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  disabled={isSubmitting}
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select an issue type</option>
                  {ISSUE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </Field>
              <Field>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <div className="flex flex-col w-full">
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the issue"
                        disabled={isSubmitting}
                        required
                        rows={4}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                     />
                </div>
            </Field>
              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Report"}
                </Button>
                {status.type !== "idle" && (
                  <FieldDescription
                    aria-live="polite"
                    className={
                      status.type === "error"
                        ? "text-destructive"
                        : "text-green-700"
                    }
                  >
                    {status.message}
                  </FieldDescription>
                )}
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}