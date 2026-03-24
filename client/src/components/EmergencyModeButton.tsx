import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type ChargingPoint = {
  charging_point_id?: string;
  charging_point_location?: string;
  distance?: number;
  latitude?: number;
  longitude?: number;
  shorthand_name?: string;
};

type Props = {
  chargingPoints: ChargingPoint[];
  userLocation: { lat: number; lng: number } | null;
  onPointSelected: (point: ChargingPoint) => void;
  onEmergencyToggle?: (active: boolean) => void; 
};

export default function EmergencyModeButton({
  chargingPoints,
  userLocation,
  onPointSelected,
  onEmergencyToggle,
}: Props) {
  const { t } = useTranslation();
  const [active, setActive] = useState(false);

  const handleToggle = () => {
    const next = !active;
    setActive(next);
    onEmergencyToggle?.(next);

    if (next && chargingPoints.length > 0) {
      onPointSelected(chargingPoints[0]);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Button
        onClick={handleToggle}
        style={{
          backgroundColor: active ? "#1c5fcc" : "#348ceb",
          color: "white",
          border: "none",
          transition: "background-color 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = active ? "#174fa8" : "#1c5fcc";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = active ? "#1c5fcc" : "#348ceb";
        }}
      >
        {active ? t("emergency.toggle.on") : t("emergency.toggle.off")}
      </Button>

      {active && (
        <Card style={{
          position: "absolute",
          top: "100%",
          left: 0,
          zIndex: 1000,
          minWidth: "220px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        }}>
          <CardHeader>
            <CardTitle style={{ fontSize: "14px" }}>
              ⚡ {t("emergency.panel.title")}
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-2">
            {chargingPoints.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {t("emergency.panel.noPoints")}
              </p>
            )}

            {chargingPoints.slice(0, 1).map((point) => (
              <Button
                key={point.charging_point_id}
                variant="outline"
                onClick={() => onPointSelected(point)}
                className="justify-start"
                style={{ borderColor: "#1c5fcc", color: "#1c5fcc" }}
              >
                📍 {point.shorthand_name || point.charging_point_location || t("emergency.unknownPoint")}
                {point.distance != null && (
                  <span style={{ marginLeft: "8px", fontSize: "12px", color: "#888" }}>
                    {point.distance < 1
                      ? `${Math.round(point.distance * 1000)}m`
                      : `${point.distance.toFixed(1)}km`}
                  </span>
                )}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}