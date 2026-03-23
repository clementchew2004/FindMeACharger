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
import { useTranslation } from "react-i18next";

const API_BASE: string = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

type ReportFormProps = React.ComponentProps<"div">;

export function ReportForm({ className, ...props }: ReportFormProps) {
  const { t } = useTranslation();
  const ISSUE_TYPES = [
    t("report.issue.broken"),
    t("report.issue.blocked"),
    t("report.issue.payment"),
    t("report.issue.safety"),
    t("report.issue.other"),
  ];

  const ISSUE_TYPES_EN = [
    "Broken / Not Working",
    "Blocked / Inaccessible",
    "Payment Issue",
    "Safety Concern",
    "Other",
  ];
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
      .catch((_) => { });
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

      if (!response.ok) throw new Error(t("report.error"));

      setStatus({
        type: "success",
        message: t("report.success"),
      });
      setChargingPointId("");
      setIssueType("");
      setDescription("");
    } catch {
      setStatus({
        type: "error",
        message: t("report.error"),
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
          <CardTitle>{t("report.title")}</CardTitle>
          <CardDescription>
            {t("report.description")}
          </CardDescription>
          <NavLink
            to="/routing"
            style={{ ...navLinkStyle, margin: 0, float: "none" }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1c5fcc"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#348ceb"}
          >
            {t("report.backToMap")}
          </NavLink>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="chargingPointId">{t("report.chargingPoint")}</FieldLabel>
                <Input
                  id="chargingPointId"
                  type="text"
                  value={chargingPointId}
                  onChange={(e) => setChargingPointId(e.target.value)}
                  placeholder={t("report.chargingPointPlaceholder")}
                  disabled={isSubmitting}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="issueType">{t("report.issueType")}</FieldLabel>
                <select
                  id="issueType"
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  disabled={isSubmitting}
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">{t("report.issueTypeSelect")}</option>
                  {(issueTypes.length === 0 ? ISSUE_TYPES : issueTypes).map((type, index) => {
                    const value = issueTypes.length === 0 ? ISSUE_TYPES_EN[index] : type;
                    return (
                      <option key={typeof type === 'string' ? type : index} value={value}>
                        {type}
                      </option>
                    );
                  })}
                </select>
              </Field>
              <Field>
                <FieldLabel htmlFor="description">{t("report.descLabel")}</FieldLabel>
                <div className="flex flex-col w-full">
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t("report.descPlaceholder")}
                    disabled={isSubmitting}
                    required
                    rows={4}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                  />
                </div>
              </Field>
              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? t("report.submitting") : t("report.submit")}
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