import { cn } from "@/lib/utils";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useNavigate } from "react-router-dom";
import { authClient } from "@/lib/auth-client";

type ChargingPoint = {
  id: string;
  name: string;
  location: string;
  status: "active" | "suspended";
  accessibility: string | string[];
  cost: string;
  lat: string;
  lng: string;
};

type ChargingPointManagementProps = React.ComponentProps<"div">;

const MOCK_DATA: ChargingPoint[] = [
  { id: "CP-001", name: "Hey Brew Cafe", location: "Hey Brew Cafe, Birmingham", status: "active", accessibility: "Wheelchair accessible", cost: "£0.28/kWh", lat: "52.4862", lng: "-1.8904" },
  { id: "CP-002", name: "Bullring Charging", location: "Bullring, Birmingham B5 4BE", status: "active", accessibility: "wheelchair access", cost: "£0.32/kWh", lat: "52.4775", lng: "-1.8936" },
  { id: "CP-003", name: "Selly Oak Station", location: "Selly Oak Station, B29", status: "suspended", accessibility: "Step-free access", cost: "£0.22/kWh", lat: "52.4380", lng: "-1.9354" },
];

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/avif"];

export function ChargingPointManagement({ className, ...props }: ChargingPointManagementProps) {
  const { t } = useTranslation();
  const ACCESSIBILITY_OPTIONS = [
    t("operator.accessibility.stepFree"),
    t("operator.accessibility.wellLit"),
    t("operator.accessibility.sheltered"),
    t("operator.accessibility.seating"),
    t("operator.accessibility.cctv"),
    t("operator.accessibility.publicTransport"),
    t("operator.accessibility.wheelchair"),
  ];

  const [points, setPoints] = useState<ChargingPoint[]>(MOCK_DATA);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadLabel, setUploadLabel] = useState(t("operator.uploadLabel"));
  const [statusMsg, setStatusMsg] = useState<{ type: "idle" | "success" | "error"; message: string }>({ type: "idle", message: "" });
  const [form, setForm] = useState({ name: "", id: "", location: "", cost: "", lat: "", lng: "", accessibility: [] as string[]  });
  const navigate = useNavigate();

  const showMessage = (message: string, type: "success" | "error" = "success") => {
    setStatusMsg({ type, message });
    setTimeout(() => setStatusMsg({ type: "idle", message: "" }), 3000);
  };

  const resetForm = () => {
    setForm({ name: "", id: "", location: "", cost: "", lat: "", lng: "", accessibility: [] as string[] });
    setUploadLabel(t("operator.uploadLabel"));
    setShowForm(false);
    setEditingId(null);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (cp: ChargingPoint) => {
  setEditingId(cp.id);
  setForm({ name: cp.name, id: cp.id, location: cp.location, cost: cp.cost, lat: cp.lat, lng: cp.lng, 
    accessibility: Array.isArray(cp.accessibility) 
  ? cp.accessibility 
  : cp.accessibility ? cp.accessibility.split(", ") : []
  });
  setShowForm(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      showMessage(t("operator.error.invalidFile"), "error");
      return;
    }
    setUploadLabel(t("operator.uploadSelected", { fileName: file.name }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.id) return;

    if (editingId) {
      setPoints(points.map(cp => cp.id === editingId ? { ...cp, ...form } : cp));
      showMessage(t("operator.success.updated"));
    } else {
      setPoints([...points, { ...form, status: "active" }]);
      showMessage(t("operator.success.added"));
    }
    resetForm();
  };

  const toggleSuspend = (id: string) => {
    setPoints(points.map(cp => cp.id === id ? { ...cp, status: cp.status === "active" ? "suspended" : "active" } : cp));
    const cp = points.find(p => p.id === id);
    if (cp?.status === "active") {
        showMessage(t("operator.success.suspended"));
    } else {
        showMessage(t("operator.success.reactivated"));
    }
  };

  const removePoint = (id: string) => {
    setPoints(points.filter(cp => cp.id !== id));
    showMessage(t("operator.success.removed"));
  };

  const toggleAccessibility = (option: string) => {
  setForm(prev => ({
    ...prev,
    accessibility: prev.accessibility.includes(option)
      ? prev.accessibility.filter(a => a !== option)
      : [...prev.accessibility, option]
    }));
  };

  const handleLogout = async () => {
    await authClient.signOut();
    navigate("/");
  };

  const activeCount = points.filter(p => p.status === "active").length;
  const suspendedCount = points.filter(p => p.status === "suspended").length;

  const inputStyle = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900";

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
    <div className={cn("min-h-screen bg-gray-50 p-6", className)} {...props}>
      <NavLink
        to="/"
        style={{ ...navLinkStyle, margin: 0, float: "none" }}
        onClick={handleLogout}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1c5fcc")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#348ceb")}
      >
        Logout
      </NavLink>

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-medium text-gray-900">{t("operator.managementTitle")}</h1>
          <p className="text-sm text-gray-500 mt-1">{t("operator.managementSubtitle")}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: t("operator.stats.total"), value: points.length, color: "text-gray-900" },
            { label: t("operator.stats.active"), value: activeCount, color: "text-green-700" },
            { label: t("operator.stats.suspended"), value: suspendedCount, color: "text-red-700" },
          ].map(stat => (
            <div key={stat.label} className="bg-gray-100 rounded-lg px-4 py-3">
              <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
              <p className={`text-2xl font-medium ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Status message */}
        {statusMsg.type !== "idle" && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${statusMsg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {statusMsg.message}
          </div>
        )}

        {/* Add / Edit Form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
            <h2 className="text-sm font-medium text-gray-900 mb-4">
              {editingId ? t("operator.editTitle") : t("operator.addTitle")}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">{t("operator.name")}</label>
                  <input className={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={t("operator.namePlaceholder")} required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">{t("operator.form.shorthandId")}</label>
                  <input className={inputStyle} value={form.id} onChange={e => setForm({ ...form, id: e.target.value })} placeholder="e.g. CP-004" required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">{t("operator.location")}</label>
                  <input className={inputStyle} value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder={t("operator.locationPlaceholder")} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">{t("operator.cost")}</label>
                  <input className={inputStyle} value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} placeholder={t("operator.costPlaceholder")} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">{t("operator.form.latitude")}</label>
                  <input className={inputStyle} value={form.lat} onChange={e => setForm({ ...form, lat: e.target.value })} placeholder="e.g. 52.4862" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">{t("operator.form.longitude")}</label>
                  <input className={inputStyle} value={form.lng} onChange={e => setForm({ ...form, lng: e.target.value })} placeholder="e.g. -1.8904" />
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-xs text-gray-500">{t("operator.form.accessibilityOptions")}</label>
                <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "12px", background: "#f9fafb", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {ACCESSIBILITY_OPTIONS.map(option => (
                    <label key={option} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input
                    type="checkbox"
                    checked={form.accessibility.includes(option)}
                    onChange={() => toggleAccessibility(option)}
                    style={{ margin: "0" }}
                />
                <span style={{ fontSize: "12px", color: "#4b5563" }}>{option}</span>
                </label>
                ))}
                </div>

        {form.accessibility.length > 0 && (
            <p className="text-xs text-gray-400 mt-1">
                {t("operator.form.selected", { options: form.accessibility.join(", ") })}
            </p>
        )}
        </div>

                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-xs text-gray-500">{t("operator.form.photoEvidence")}</label>
                  <label className="flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-lg py-4 px-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition">
                    <span className="text-lg mb-1">+</span>
                    <span className="text-xs text-gray-400">{uploadLabel}</span>
                    <input type="file" accept=".jpg,.jpeg,.png,.webp,.heic,.avif" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition">
                  {editingId ? t("operator.saveChanges") : t("operator.addPoint")}
                </button>
                <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition">
                  {t("operator.cancel")}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-700">{t("operator.list.title")}</span>
          {!showForm && (
            <button onClick={openAddForm} className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition text-gray-700">
              {t("operator.addNew")}
            </button>
          )}
        </div>

        {/* Charging Points List */}
        <div className="flex flex-col gap-3">
          {points.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-sm text-gray-400">
              {t("operator.list.noPoints")}
            </div>
          )}
          {points.map(cp => (
            <div key={cp.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:border-gray-200 transition">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{cp.name}</p>
                  <p className="text-xs text-gray-400">{cp.id}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cp.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {cp.status === "active" ? t("operator.status.active") : t("operator.status.suspended")}
                </span>
              </div>
              <div className="flex flex-col gap-1 mb-3">
                <p className="text-xs text-gray-500">{t("operator.list.location", { location: cp.location })}</p>
                <p className="text-xs text-gray-500">{t("operator.list.accessibility", { accessibility: Array.isArray(cp.accessibility) ? cp.accessibility.join(", ") : cp.accessibility })} </p>
                <p className="text-xs text-gray-500">{t("operator.list.cost", { cost: cp.cost })}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEditForm(cp)} className="px-3 py-1.5 text-xs font-medium border border-gray-200 bg-white text-gray-600 rounded-lg hover:bg-gray-50 transition">
                  {t("operator.edit")}
                </button>
                <button onClick={() => toggleSuspend(cp.id)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${cp.status === "active" ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100" : "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"}`}>
                  {cp.status === "active" ? t("operator.suspend") : t("operator.reactivate")}
                </button>
                <button onClick={() => removePoint(cp.id)} className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition">
                  {t("operator.remove")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}