import { cn } from "@/lib/utils";
import { useState } from "react";

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

const ACCESSIBILITY_OPTIONS = [
  "Step-free access",
  "Well lit at night",
  "Sheltered",
  "Seating nearby",
  "CCTV monitored",
  "Near public transport",
  "Wheelchair accessible",
];

export function ChargingPointManagement({ className, ...props }: ChargingPointManagementProps) {
  const [points, setPoints] = useState<ChargingPoint[]>(MOCK_DATA);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadLabel, setUploadLabel] = useState("Upload image — JPEG, PNG, WEBP, HEIC, AVIF accepted");
  const [statusMsg, setStatusMsg] = useState<{ type: "idle" | "success" | "error"; message: string }>({ type: "idle", message: "" });
  const [form, setForm] = useState({ name: "", id: "", location: "", cost: "", lat: "", lng: "", accessibility: [] as string[]  });
  

  const showMessage = (message: string, type: "success" | "error" = "success") => {
    setStatusMsg({ type, message });
    setTimeout(() => setStatusMsg({ type: "idle", message: "" }), 3000);
  };

  const resetForm = () => {
    setForm({ name: "", id: "", location: "", cost: "", lat: "", lng: "", accessibility: "" });
    setUploadLabel("Upload image — JPEG, PNG, WEBP, HEIC, AVIF accepted");
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
      showMessage("Invalid file type. Please upload JPEG, PNG, WEBP, HEIC or AVIF.", "error");
      return;
    }
    setUploadLabel(`Selected: ${file.name}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.id) return;

    if (editingId) {
      setPoints(points.map(cp => cp.id === editingId ? { ...cp, ...form } : cp));
      showMessage("Charging point updated successfully.");
    } else {
      setPoints([...points, { ...form, status: "active" }]);
      showMessage("New charging point added successfully.");
    }
    resetForm();
  };

  const toggleSuspend = (id: string) => {
    setPoints(points.map(cp => cp.id === id ? { ...cp, status: cp.status === "active" ? "suspended" : "active" } : cp));
    const cp = points.find(p => p.id === id);
    showMessage(cp?.status === "active" ? "Charging point suspended." : "Charging point reactivated.");
  };

  const removePoint = (id: string) => {
    setPoints(points.filter(cp => cp.id !== id));
    showMessage("Charging point removed.");
  };

  const toggleAccessibility = (option: string) => {
  setForm(prev => ({
    ...prev,
    accessibility: prev.accessibility.includes(option)
      ? prev.accessibility.filter(a => a !== option)
      : [...prev.accessibility, option]
    }));
  };

  const activeCount = points.filter(p => p.status === "active").length;
  const suspendedCount = points.filter(p => p.status === "suspended").length;

  const inputStyle = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900";

  return (
    <div className={cn("min-h-screen bg-gray-50 p-6", className)} {...props}>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-medium text-gray-900">Charging point management</h1>
          <p className="text-sm text-gray-500 mt-1">Add, update or suspend charging points across your network</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Total points", value: points.length, color: "text-gray-900" },
            { label: "Active", value: activeCount, color: "text-green-700" },
            { label: "Suspended", value: suspendedCount, color: "text-red-700" },
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
              {editingId ? "Edit charging point" : "Add new charging point"}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">Name</label>
                  <input className={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Hey Brew Cafe" required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">Shorthand ID</label>
                  <input className={inputStyle} value={form.id} onChange={e => setForm({ ...form, id: e.target.value })} placeholder="e.g. CP-004" required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">Location</label>
                  <input className={inputStyle} value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Address" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">Cost</label>
                  <input className={inputStyle} value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} placeholder="e.g. £0.30/kWh" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">Latitude</label>
                  <input className={inputStyle} value={form.lat} onChange={e => setForm({ ...form, lat: e.target.value })} placeholder="e.g. 52.4862" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">Longitude</label>
                  <input className={inputStyle} value={form.lng} onChange={e => setForm({ ...form, lng: e.target.value })} placeholder="e.g. -1.8904" />
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-xs text-gray-500">Accessibility options</label>
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
                Selected: {form.accessibility.join(", ")}
            </p>
        )}
        </div>

                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-xs text-gray-500">Photo evidence</label>
                  <label className="flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-lg py-4 px-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition">
                    <span className="text-lg mb-1">+</span>
                    <span className="text-xs text-gray-400">{uploadLabel}</span>
                    <input type="file" accept=".jpg,.jpeg,.png,.webp,.heic,.avif" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition">
                  {editingId ? "Save changes" : "Add charging point"}
                </button>
                <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-700">Your charging points</span>
          {!showForm && (
            <button onClick={openAddForm} className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition text-gray-700">
              + Add new
            </button>
          )}
        </div>

        {/* Charging Points List */}
        <div className="flex flex-col gap-3">
          {points.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-sm text-gray-400">
              No charging points found.
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
                  {cp.status === "active" ? "Active" : "Suspended"}
                </span>
              </div>
              <div className="flex flex-col gap-1 mb-3">
                <p className="text-xs text-gray-500">Location: {cp.location}</p>
                <p className="text-xs text-gray-500">Accessibility: {Array.isArray(cp.accessibility) ? cp.accessibility.join(", ") : cp.accessibility} </p>
                <p className="text-xs text-gray-500">Cost: {cp.cost}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEditForm(cp)} className="px-3 py-1.5 text-xs font-medium border border-gray-200 bg-white text-gray-600 rounded-lg hover:bg-gray-50 transition">
                  Edit
                </button>
                <button onClick={() => toggleSuspend(cp.id)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${cp.status === "active" ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100" : "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"}`}>
                  {cp.status === "active" ? "Suspend" : "Reactivate"}
                </button>
                <button onClick={() => removePoint(cp.id)} className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}