import { cn } from "@/lib/utils";
import { useState } from "react";

type ChargingPoint = {
  id: string;
  name: string;
  location: string;
  status: "active" | "suspended";
  accessibility: string;
  cost: string;
};

type OperatorDashboardProps = React.ComponentProps<"div">;

const MOCK_CHARGING_POINTS: ChargingPoint[] = [
  { id: "CP-001", name: "Hey Brew Cafe", location: "Hey Brew Cafe, Birmingham", status: "active", accessibility: "Wheelchair accessible, Well lit at night", cost: "£0.28/kWh" },
  { id: "CP-002", name: "Bullring Open Charging Station", location: "Bullring, Birmingham B5 4BE", status: "active", accessibility: "Wheelchair accessible, Wide bay available, Covered", cost: "£0.32/kWh" },
  { id: "CP-003", name: "West Midland Railway Selly Oak Station", location: "Selly Oak Station, Birmingham B29", status: "suspended", accessibility: "Step-free access, Blue badge parking nearby", cost: "£0.22/kWh" },
];

export function OperatorDashboard({ className, ...props }: OperatorDashboardProps) {
  const [chargingPoints, setChargingPoints] = useState<ChargingPoint[]>(MOCK_CHARGING_POINTS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPoint, setEditingPoint] = useState<ChargingPoint | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: "idle" | "success" | "error"; message: string }>({ type: "idle", message: "" });
  const [form, setForm] = useState({ name: "", location: "", accessibility: "", cost: "" });

  const resetForm = () => {
    setForm({ name: "", location: "", accessibility: "", cost: "" });
    setShowAddForm(false);
    setEditingPoint(null);
  };

  const handleAdd = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newPoint: ChargingPoint = {
      id: `CP-${String(chargingPoints.length + 1).padStart(3, "0")}`,
      ...form,
      status: "active",
    };
    setChargingPoints([...chargingPoints, newPoint]);
    setStatusMsg({ type: "success", message: "Charging point added successfully!" });
    resetForm();
  };

  const handleUpdate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingPoint) return;
    setChargingPoints(chargingPoints.map((cp) => cp.id === editingPoint.id ? { ...editingPoint, ...form } : cp));
    setStatusMsg({ type: "success", message: "Charging point updated!" });
    resetForm();
  };

  const handleSuspend = (id: string) => {
    setChargingPoints(chargingPoints.map((cp) => cp.id === id ? { ...cp, status: cp.status === "active" ? "suspended" : "active" } : cp));
  };

  const handleDelete = (id: string) => {
    setChargingPoints(chargingPoints.filter((cp) => cp.id !== id));
    setStatusMsg({ type: "success", message: "Charging point removed." });
  };

  const startEdit = (cp: ChargingPoint) => {
    setEditingPoint(cp);
    setForm({ name: cp.name, location: cp.location, accessibility: cp.accessibility, cost: cp.cost });
    setShowAddForm(true);
  };

  const inputStyle = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className={cn("min-h-screen bg-gray-50 p-6", className)} {...props}>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Operator Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Manage charging points — add, update or suspend them</p>
        </div>

        {/* Status Message */}
        {statusMsg.type !== "idle" && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${statusMsg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {statusMsg.message}
          </div>
        )}

        {/* Add / Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-800 mb-4">
              {editingPoint ? "Edit Charging Point" : "Add New Charging Point"}
            </h2>
            <form onSubmit={editingPoint ? handleUpdate : handleAdd} className="flex flex-col gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input className={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter charging point name" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input className={inputStyle} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Enter address" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Accessibility Info</label>
                <input className={inputStyle} value={form.accessibility} onChange={(e) => setForm({ ...form, accessibility: e.target.value })} placeholder="e.g. Wheelchair accessible" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
                <input className={inputStyle} value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} placeholder="e.g. £0.30/kWh" required />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition">
                  {editingPoint ? "Save Changes" : "Add Charging Point"}
                </button>
                <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Add Button */}
        {!showAddForm && (
          <button onClick={() => setShowAddForm(true)} className="mb-5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition">
            + Add New Charging Point
          </button>
        )}

        {/* Charging Points List */}
        <div className="flex flex-col gap-3">
          {chargingPoints.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-sm text-gray-400">
              No charging points found.
            </div>
          )}
          {chargingPoints.map((cp) => (
            <div key={cp.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{cp.name}</h3>
                  <span className="text-xs text-gray-400">{cp.id}</span>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cp.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {cp.status === "active" ? "Active" : "Suspended"}
                </span>
              </div>
              <div className="flex flex-col gap-1 mb-4 text-sm text-gray-500">
                <p>Location: {cp.location}</p>
                <p>Accessibility: {cp.accessibility}</p>
                <p>Cost: {cp.cost}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(cp)} className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                  Edit
                </button>
                <button onClick={() => handleSuspend(cp.id)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${cp.status === "active" ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-green-100 text-green-700 hover:bg-green-200"}`}>
                  {cp.status === "active" ? "Suspend" : "Reactivate"}
                </button>
                <button onClick={() => handleDelete(cp.id)} className="px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition">
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