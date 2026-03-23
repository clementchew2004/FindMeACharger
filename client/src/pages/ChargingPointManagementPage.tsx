import { ChargingPointManagement } from "@/components/charging-point-management";

export default function ChargingPointManagementPage() {
  return (
    <div style={{ width: "100%", paddingTop: "80px", paddingLeft: "40px", paddingRight: "40px" }}>
      <div style={{ width: "100%", maxWidth: "720px", marginLeft: "80px" }}>
        <ChargingPointManagement />
      </div>
    </div>
  );
}