import L, { LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { GeoJSON, MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { NavLink } from "react-router-dom";
import { CycleIcon, DriveIcon, WalkIcon, WheelchairIcon } from "../components/ModeIcons";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const API_BASE: string = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const uob = new LatLng(52.449832, -1.930633);

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

const iconOption = L.divIcon({
  className: "marker-c",
  html: `
    <div style="position: relative; width: 32px; height: 32px;">
      <svg viewBox="0 0 384 512" fill="#e75dd7" xmlns="http://www.w3.org/2000/svg">
        <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z"/>
      </svg>
      <div style="position: absolute; top: 7px; left: 0; width: 100%; text-align: center; color: white; font-weight: bold; font-family: sans-serif; font-size: 14px;">C</div>
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
  const { t } = useTranslation();
  const [routeData, setRouteData] = useState<any>(null);
  const [routeSummary, setRouteSummary] = useState<{ distance: string, duration: number; } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [maxDistance, setMaxDistance] = useState(30);
  const [showMarkerInfo, setShowMarkerInfo] = useState(false);
  const [location, setLocation] = useState<{ position: LatLng, error: string | null; }>({ position: uob, error: null });
  const [chargingPoints, setChargingPoints] = useState<any>([]);
  const [targetPoint, setTargetPoint] = useState<any>(null);
  const [targetPointBays, setTargetPointBays] = useState<any>(null);
  const [updateCounter, setUpdateCounter] = useState<number>(0);
  const geoJSONReference = useRef<any>(null);
  const [mode, setMode] = useState<string>("foot-walking");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            position: new LatLng(position.coords.latitude, position.coords.longitude),
            error: null
          });
        },
        (error) => {
          setLocation({
            position: uob,
            error: error.message
          });
        },
        {
          enableHighAccuracy: true
        }
      );
    }
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/api/charging-points/nearby?longitude=${location.position.lng}&latitude=${location.position.lat}&maxDistance=${maxDistance}`)
      .then(response => {
        if (response.status === 204 || response.status === 500) return [];
        else return response.json();
      })
      .then(data => {
        setChargingPoints(data);
      })
      .catch(console.error);

  }, [location, maxDistance]);

  useEffect(() => {
    if (!targetPoint) return;
    fetch(`${API_BASE}/api/charging-points/${targetPoint.charging_point_id}/status`)
      .then(response => {
        if (response.status === 404 || response.status === 500) return null;
        else return response.json();
      })
      .then(data => setTargetPointBays(data))
      .catch(console.error);
  }, [targetPoint, updateCounter]);

  const getRoute = async () => {
    // ORS uses "longitude,latitude"
    const startStr = `${(location.position.lng)},${location.position.lat}`;
    const endStr = `${targetPoint.longitude},${targetPoint.latitude}`;

    try {
      const response = await fetch(`${API_BASE}/api/get-route?start=${startStr}&end=${endStr}&mode=${mode}`);
      if (response.ok) {
        const data = await response.json();
        setRouteData(data);
        if (geoJSONReference.current) {
          geoJSONReference.current.clearLayers();
          geoJSONReference.current.addData(data);
        }

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

  const makeBooking = (b_customer_id: number, bay_id: number) => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_id: b_customer_id, charging_bay_id: bay_id, booking_length: 60 })
    };

    fetch(`${API_BASE}/api/booking`, requestOptions)
      .then(response => response.json())
      .then(() => {
        setUpdateCounter(updateCounter + 1);
      })
      .catch(console.error);
  };

  const navLinkStyle: React.CSSProperties = {
    float: "right",
    marginRight: "10px",
    padding: "8px 20px",
    margin: "15px 6px",
    border: "none",
    borderRadius: "5px",
    backgroundColor: "#348ceb",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block"
  };

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column" }}>
      <style>{`
        .mode-container {
          display: inline-flex;
          gap: 5px;
          margin: 10px;
          vertical-align: middle;
          flex-wrap: wrap;
        }
        @media (max-width: 600px) {
          .mode-label {
            display: none !important;
          }
          .mode-container {
            margin: 5px 0;
          }
        }
      `}</style>
      <div style={{ padding: "10px", flexShrink: 0, position: "relative", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <input
            placeholder={t("map.searchPlaceholder")}
            style={{ padding: "8px", width: "100%", maxWidth: "300px", boxSizing: "border-box", margin: 0 }}
          />
          <div style={{  display: "flex", gap: "10px", alignItems: "center" }}>
            <LanguageSwitcher />
            <NavLink
              style={{ ...navLinkStyle, margin: 0, float: "none" }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1c5fcc"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#348ceb"}
              to="/profile"
            >
              {t("map.myProfile")}
            </NavLink>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", justifyContent: "space-between" }}>
          <button style={{ margin: 0 }} onClick={() => setShowFilters(!showFilters)}>{t("map.filters")}</button>
          
          <NavLink
            to="/report"
            style={{ ...navLinkStyle, margin: 0, float: "none" }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1c5fcc"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#348ceb"}
          >
            Report a problem
          </NavLink>

          <div style={{  display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            <div className="mode-container" style={{ margin: 0, marginLeft: "auto" }}>
              {[
                { id: "foot-walking", label: t("map.mode.walk"), icon: <WalkIcon /> },
                { id: "cycling-regular", label: t("map.mode.cycle"), icon: <CycleIcon /> },
                { id: "driving-car", label: t("map.mode.drive"), icon: <DriveIcon /> },
                { id: "wheelchair", label: t("map.mode.wheelchair"), icon: <WheelchairIcon /> }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  style={{
                    margin: 0,
                    padding: "8px 12px",
                    backgroundColor: mode === m.id ? "#348ceb" : "#f3f4f6",
                    color: mode === m.id ? "white" : "black",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "14px"
                  }}
                  title={m.label}
                  aria-pressed={mode === m.id}
                >
                  {m.icon}
                  <span className="mode-label">{m.label}</span>
                </button>
              ))}
            </div>

            <button onClick={getRoute} style={{ margin: 0, padding: "8px 12px", fontSize: "14px" }}>{t("map.calculateRoute")}</button>
          </div>
        </div>

        {routeSummary && (
          <div style={{ fontSize: "14px", display: "flex", gap: "15px", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <p style={{ margin: 0 }}><strong>{t("map.distance")}:</strong> {routeSummary.distance} km</p>
            <p style={{ margin: 0 }}><strong>{t("map.duration")}:</strong> {routeSummary.duration} mins</p>
          </div>
        )}

        {showFilters && (
          <div style={{
            position: "absolute",
            top: "100%",
            left: "10px",
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
              <h2 style={{ margin: 0 }}>{t("map.filters")}</h2>
              <button onClick={() => setShowFilters(false)}>{t("map.applyFilters")}</button>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontWeight: "bold" }}>{t("map.maxDistance")}: {maxDistance}</label>
              <input
                type="range"
                min="1"
                max="20"
                value={maxDistance}
                style={{ width: "80%" }}
                onChange={(e) => setMaxDistance(Number(e.target.value))} />
            </div>

            <div style={{ marginBottom: "10px" }}>
              <p style={{ fontWeight: "bold", marginBottom: "5px" }}>{t("map.cost")}:</p>
              <label style={{ display: "block", marginBottom: "4px" }}>
                <input type="checkbox" style={{ marginRight: "8px", marginTop: "20px" }} />
                <span style={{ position: "relative", top: "-25px" }}>{t("map.free")}</span>
              </label>
              <label style={{ display: "block", marginBottom: "4px" }}>
                <input type="checkbox" style={{ marginRight: "8px", marginTop: "2px" }} />
                <span style={{ position: "relative", top: "-25px" }}>{t("map.paid")}</span>
              </label>
            </div>

            <div style={{ marginBottom: "10px" }}>
              <label style={{ display: "block", fontWeight: "bold" }}>
                <input type="checkbox" style={{ marginRight: "8px", marginTop: "2px" }} />
                <span style={{ position: "relative", top: "-25px" }}>{t("map.availableOnly")}</span>
              </label>
            </div>

            <div>
              <p style={{ fontWeight: "bold", marginTop: "5px" }}>{t("map.accessibility")}:</p>
              <label style={{ display: "block", marginBottom: "4px" }}>
                <input type="checkbox" style={{ marginRight: "8px", marginTop: "10px" }} />
                <span style={{ position: "relative", top: "-25px" }}>{t("map.wheelchairAccess")}</span>
              </label>
              <label style={{ display: "block", marginBottom: "4px" }}>
                <input type="checkbox" style={{ marginRight: "8px", marginTop: "10px" }} />
                <span style={{ position: "relative", top: "-25px" }}>{t("map.noBlockedSockets")}</span>
              </label>
            </div>
          </div>
        )}

      </div>
      <div style={{ flex: 1, position: "relative" }}>
        {showMarkerInfo && targetPoint && (
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
            //width: "280px"
          }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <h3 style={{ margin: 0 }}>{targetPoint.shorthand_name}</h3>
                <button onClick={() => {
                  setShowMarkerInfo(false);
                  setTargetPoint(null);
                }}>✕</button>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <div>
                  <p><strong>{t("map.info.availability")}:</strong> {targetPointBays ? (targetPointBays.overallStatus) : t("map.info.loading")}</p>
                  <p><strong>{t("map.info.cost")}:</strong> (Free or price)</p>
                  <p><strong>{t("map.wheelchairAccess")}:</strong> (Yes or No)</p>
                  <p><strong>{t("map.noBlockedSockets")}:</strong> (Yes or No)</p>
                  <p><strong>{t("map.info.userReports")}:</strong> (Reports)</p>
                </div>
                {targetPointBays && (
                  <table>
                    <thead>
                      <tr>
                        <td><strong>{t("map.info.bay")}</strong></td>
                        <td><strong>{t("map.info.chargerType")}</strong></td>
                        <td><strong>{t("map.info.availability")}</strong></td>
                      </tr>
                    </thead>
                    <tbody>
                      {targetPointBays.bays.map((bay: any) => (
                        <tr key={bay.charging_bay_id}>
                          <td>{t("map.info.bay")} {bay.charging_bay_number}</td>
                          <td>{bay.bay_type_name}</td>
                          <td>{bay.status}</td>
                          <td>
                            {bay.status === "available" ?
                              <button
                                onClick={() => {
                                  makeBooking(-1, bay.charging_bay_id);
                                }}
                                style={{
                                  backgroundColor: "limegreen"
                                }}>{t("map.info.book")}</button> :
                              <button style={{
                                backgroundColor: "red"
                              }}
                                disabled={true}>{t("map.info.busy")}</button>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

            </div>

          </div>
        )}

        <MapContainer zoomSnap={0.2} center={location.position} zoom={15} style={{ height: "100%", width: "100%", position: "absolute", top: 0, left: 0 }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {location && <Marker position={location.position} icon={iconA} />}
          {targetPoint && <Marker position={new LatLng(targetPoint.latitude, targetPoint.longitude)} icon={iconB} eventHandlers={{ click: () => setShowMarkerInfo(true) }} />}
          {
            chargingPoints && chargingPoints.length > 0 && chargingPoints.filter((point: any) => !targetPoint || point.charging_point_id !== targetPoint.charging_point_id).map((point: any) => (
              <Marker
                key={point.charging_point_id}
                position={new LatLng(point.latitude, point.longitude)}
                icon={iconOption}
                eventHandlers={
                  {
                    click: () => {
                      setTargetPoint(point);
                      setShowMarkerInfo(true);
                    }
                  }
                }
              />
            ))
          }
          {routeData && (
            <>
              <GeoJSON data={routeData} ref={(layer) => { geoJSONReference.current = layer; }} style={{ color: "#3f00f6", weight: 7 }} />
              <FitBounds data={routeData} />
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapRoutingPage;