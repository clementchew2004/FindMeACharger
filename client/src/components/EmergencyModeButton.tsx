import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { useTranslation } from "react-i18next";

// adjusted to match api response -ivan
type ChargingPoint = {
  charging_point_id?: string;
  charging_point_location?: string;
  distance?: number;
  latitude?: number;
  longitude?: number;
  shorthand_name?: string;
  // id?: string;
  // name?: string;
  // lat?: number;
  // lng?: number;
};

type Props = {
  chargingPoints: ChargingPoint[];
  userLocation: { lat: number; lng: number } | null;
  onPointSelected: (point: ChargingPoint) => void;
};

export default function EmergencyModeButton({
  chargingPoints,
  userLocation,
  onPointSelected,
}: Props) {
  const { t } = useTranslation();
  const [active, setActive] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      {/* Toggle button */}
      <Button
        onClick={() => setActive(!active)}
        className={active ? "bg-red-600 hover:bg-red-700" : ""}
      >
        {active ? t("emergency.toggle.on") : t("emergency.toggle.off")}
      </Button>

      {/* Emergency panel */}
      {active && (
        <Card>
          <CardHeader>
            <CardTitle>{t("emergency.panel.title")}</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-2">
            {chargingPoints.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {t("emergency.panel.noPoints")}
              </p>
            )}

            {chargingPoints.map((point) => (
              <Button
                key={point.charging_point_id}
                variant="outline"
                onClick={() => onPointSelected(point)}
                className="justify-start"
              >
                {point.shorthand_name || point.charging_point_location || t("emergency.unknownPoint")}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}