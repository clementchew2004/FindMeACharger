import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";

type ChargingPoint = {
  id: string;
  name: string;
  lat: number;
  lng: number;
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
  const [active, setActive] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      {/* Toggle button */}
      <Button
        onClick={() => setActive(!active)}
        className={active ? "bg-red-600 hover:bg-red-700" : ""}
      >
        {active ? "Exit Emergency Mode" : "Emergency Mode"}
      </Button>

      {/* Emergency panel */}
      {active && (
        <Card>
          <CardHeader>
            <CardTitle>Nearby Charging Points</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-2">
            {chargingPoints.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No charging points available
              </p>
            )}

            {chargingPoints.map((point) => (
              <Button
                key={point.id}
                variant="outline"
                onClick={() => onPointSelected(point)}
                className="justify-start"
              >
                {point.name}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}