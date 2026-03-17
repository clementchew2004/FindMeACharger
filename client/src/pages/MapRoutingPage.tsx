import L, { type LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { GeoJSON, MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

const API_BASE: string = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const uob = [52.449832, -1.930633] as LatLngExpression;

const iconA = L.divIcon({
  className: "marker-a",
  html: `
    <div style="position: relative; width: 32px; height: 32px;">
      <svg viewBox="0 0 384 512" fill="#ef4444" xmlns="http://www.w3.org/2000/svg">
        <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z"/>
      </svg>
      <div style="position: absolute; top: 7px; left: 0; width: 100%; text-align: center; color: white; font-weight: bold; font-family: sans-serif; font-size: 14px;">A</div>
    </div>`,
  iconSize: [32, 42],
  iconAnchor: [16, 42]
});

const iconB = L.divIcon({
  className: "marker-b",
  html: `
    <div style="position: relative; width: 32px; height: 32px;">
      <svg viewBox="0 0 384 512" fill="#22c55e" xmlns="http://www.w3.org/2000/svg">
        <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z"/>
      </svg>
      <div style="position: absolute; top: 7px; left: 0; width: 100%; text-align: center; color: white; font-weight: bold; font-family: sans-serif; font-size: 14px;">B</div>
    </div>`,
  iconSize: [32, 42],
  iconAnchor: [16, 42]
});

const FitBounds = ({ data }: { data: any; }) => {
  const map = useMap();

  useEffect(() => {
    if (data) {
      const geoJsonLayer = L.geoJSON(data);
      map.fitBounds(geoJsonLayer.getBounds(), { padding: [50, 50] });
    }
  }, [data, map]);

  return null;
};

const MapRoutingPage = () => {
  const [routeData, setRouteData] = useState<any>(null);
  const [routeSummary, setRouteSummary] = useState<{ distance: string, duration: number; } | null>(null);
  const [points, setPoints] = useState<{ start: LatLngExpression, end: LatLngExpression; } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [maxDistance, setMaxDistance] = useState(10);
  const [showMarkerInfo, setShowMarkerInfo] = useState(false);

  const getRoute = async () => {
    // ORS uses "longitude,latitude"
    const startStr = "-1.937164239160982,52.45091210333653";
    const endStr = "-1.9275811045035742,52.44941355656794";

    const startCoords = startStr.split(",").map(Number);
    const endCoords = endStr.split(",").map(Number);

    setPoints({
      start: [startCoords[1], startCoords[0]],
      end: [endCoords[1], endCoords[0]]
    });

    try {
      const response = await fetch(`${API_BASE}/api/get-route?start=${startStr}&end=${endStr}`);
      if (response.ok) {
        const data = await response.json();
        setRouteData(data);

        if (data.features && data.features.length > 0) {
          const summary = data.features[0].properties.summary;
          setRouteSummary({
            distance: (summary.distance / 1000).toPrecision(2),
            duration: Math.round(summary.duration / 60)
          });
        }
      } else {
        console.error("Failed to fetch route");
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "10px", flexShrink: 0, position: "relative" }}>
        <input
          placeholder="Search location"
          style= {{ padding: "8px", marginRight: "10px" }}
        />

        <button onClick={() => setShowFilters(!showFilters)}>Filters</button>

        <button onClick={getRoute} style={{ padding: "10px", fontSize: "16px" }}>Calculate route</button>
        {routeSummary && (
          <div style={{ marginTop: "10px", fontSize: "16px" }}>
            <p>Distance: {routeSummary.distance} km</p>
            <p>Duration: {routeSummary.duration} minutes</p>
          </div>
        )}

        {showFilters && (
          <div style={{
            position: "absolute",
            top: "88px",
            left: "100px",
            height: "auto",
            maxHeight: "80vh",
            background: "white",
            padding: "20px",
            boxShadow: "-4px 0 10px rgba(0,0,0,0.2)",
            width: "auto",
            maxWidth: "300px",
            zIndex: 1000,
            overflowY: "auto",
            boxSizing: "border-box",
            textAlign: "left"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0 }}>Filters</h2>
              <button onClick={() => setShowFilters(false)}>Apply Filters</button>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontWeight: "bold" }}>Max Distance (km): {maxDistance}</label>
              <input 
                type="range"
                min="1"
                max="20"
                value={maxDistance}
                style={{ width: "80%" }} 
                onChange={(e) => setMaxDistance(Number(e.target.value))}/>
            </div>

            <div style={{ marginBottom: "10px" }}>
              <p style={{ fontWeight: "bold", marginBottom: "5px" }}>Cost:</p>
              <label style={{ display: "block", marginBottom: "4px" }}>
                <input type="checkbox" style={{ marginRight: "8px", marginTop: "20px" }} />
                <span style={{ position: "relative", top: "-25px" }}>Free</span>
              </label>
              <label style={{ display: "block", marginBottom: "4px" }}>
                <input type="checkbox" style={{ marginRight: "8px", marginTop: "2px" }} />
                <span style={{ position: "relative", top: "-25px" }}>Paid</span>
              </label>
            </div>

            <div style={{ marginBottom: "10px" }}>
              <label style={{ display: "block", fontWeight: "bold" }}>
                <input type="checkbox" style={{ marginRight: "8px", marginTop: "2px" }} />
                <span style={{ position: "relative", top: "-25px" }}>Available only</span>
              </label>
            </div>

            <div>
              <p style={{ fontWeight: "bold", marginTop: "5px" }}>Accessibility:</p>
              <label style={{ display: "block", marginBottom: "4px" }}>
                <input type="checkbox" style={{ marginRight: "8px", marginTop: "10px" }} />
                <span style={{ position: "relative", top: "-25px" }}>Wheelchair access</span>
              </label>
              <label style={{ display: "block", marginBottom: "4px" }}>
                <input type="checkbox" style={{ marginRight: "8px", marginTop: "10px" }} />
                <span style={{ position: "relative", top: "-25px" }}>No blocked sockets</span>
              </label>
            </div>
          </div>
        )}

      </div>
      <div style={{ flex: 1, position: "relative" }}>
        {showMarkerInfo && (
          <div style={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
            zIndex: 1000,
            width: "280px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <h3 style={{ margin: 0 }}>Location B</h3>
              <button onClick={() => setShowMarkerInfo(false)}>✕</button>
            </div>
            <p><strong>Availability:</strong> (Available or Busy)</p>
            <p><strong>Cost:</strong> (Free or price)</p>
            <p><strong>Wheelchair access:</strong> (Yes or No)</p>
            <p><strong>Blocked sockets:</strong> (Yes or No)</p>
            <p><strong>User Reports:</strong> (Reports)</p>
          </div>
        )}





        <MapContainer zoomSnap={0.2} center={uob} zoom={15} style={{ height: "100%", width: "100%", position: "absolute", top: 0, left: 0 }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {points && (
            <>
              <Marker position={points.start} icon={iconA} />
              <Marker position={points.end} icon={iconB} eventHandlers={{click: () => setShowMarkerInfo(true)}} />
            </>
          )}
          {routeData && (
            <>
              <GeoJSON data={routeData} style={{ color: "#3f00f6", weight: 7 }} />
              <FitBounds data={routeData} />
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapRoutingPage;
