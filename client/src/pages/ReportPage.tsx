import { ReportForm } from "@/components/report-form";

export default function ReportPage() {
  return (
    <div style={{ width: "100%", paddingTop: "80px", paddingLeft: "40px", paddingRight: "40px" }}>
      <div style={{ width: "100%", maxWidth: "600px", marginLeft: "100px" }}>
        <ReportForm />
      </div>
    </div>
  );
}