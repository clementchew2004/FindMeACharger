import { ChargingPointManagement } from "@/components/charging-point-management";

export default function ChargingPointManagementPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-2xl">
        <ChargingPointManagement />
      </div>
    </div>
  );
}