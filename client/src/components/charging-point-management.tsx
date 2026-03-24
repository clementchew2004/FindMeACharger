import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type ChargingPoint = {
  charging_point_id: number;
  owner_id: number;
  charging_point_name: string;
  shorthand_name: string;
  charging_point_location: string | null;
  cost_per_kwh: number | null;
  latitude: number | null;
  longitude: number | null;
  is_operational: boolean;
  accessibility_features: string[];
};

type ChargingPointManagementProps = React.ComponentProps<"div">;

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

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

  const [points, setPoints] = useState<ChargingPoint[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploadLabel, setUploadLabel] = useState(t("operator.uploadLabel"));
  const [statusMsg, setStatusMsg] = useState<{ type: "idle" | "success" | "error"; message: string }>({
    type: "idle",
    message: "",
  });

  const [form, setForm] = useState({
    name: "",
    id: "",
    location: "",
    cost: "",
    lat: "",
    lng: "",
    accessibility: [] as string[],
  });

  const showMessage = (message: string, type: "success" | "error" = "success") => {
    setStatusMsg({ type, message });
    setTimeout(() => setStatusMsg({ type: "idle", message: "" }), 3000);
  };

  const fetchChargingPoints = async () => {
    try {
      const res = await fetch(`${API_URL}/charging-points`, {
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to fetch charging points");
      }

      const data = await res.json();
      setPoints(data);
    } catch (error: any) {
      console.error(error);
      showMessage(error.message || "Failed to load charging points.", "error");
    }
  };

  useEffect(() => {
    fetchChargingPoints();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      id: "",
      location: "",
      cost: "",
      lat: "",
      lng: "",
      accessibility: [],
    });
    setUploadLabel(t("operator.uploadLabel"));
    setShowForm(false);
    setEditingId(null);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (cp: ChargingPoint) => {
    setEditingId(cp.charging_point_id);
    setForm({
      name: cp.charging_point_name ?? "",
      id: cp.shorthand_name ?? "",
      location: cp.charging_point_location ?? "",
      cost: cp.cost_per_kwh !== null ? String(cp.cost_per_kwh) : "",
      lat: cp.latitude !== null ? String(cp.latitude) : "",
      lng: cp.longitude !== null ? String(cp.longitude) : "",
      accessibility: Array.isArray(cp.accessibility_features) ? cp.accessibility_features : [],
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.id) {
      showMessage(t("operator.error.requiredFields"), "error");
      return;
    }

    const payload = {
      owner_id: 1,
      charging_point_name: form.name,
      shorthand_name: form.id,
      charging_point_location: form.location || null,
      latitude: form.lat ? Number(form.lat) : null,
      longitude: form.lng ? Number(form.lng) : null,
      cost_per_kwh: form.cost ? Number(form.cost.replace(/[^\d.]/g, "")) : null,
      accessibility_features: form.accessibility,
    };

    try {
      let res: Response;

      if (editingId) {
        res = await fetch(`${API_URL}/charging-points/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_URL}/charging-points`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            ...payload,
            is_operational: true,
          }),
        });
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save charging point");
      }

      showMessage(editingId ? t("operator.success.updated") : t("operator.success.added"));
      resetForm();
      fetchChargingPoints();
    } catch (error: any) {
      console.error(error);
      showMessage(error.message || t("operator.error.saveFailed"), "error");
    }
  };

  const toggleSuspend = async (id: number) => {
    const cp = points.find((p) => p.charging_point_id === id);
    if (!cp) return;

    try {
      const res = await fetch(`${API_URL}/charging-points/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          is_operational: !cp.is_operational,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update charging point status");
      }

      showMessage(cp.is_operational ? t("operator.success.suspended") : t("operator.success.reactivated"));
      fetchChargingPoints();
    } catch (error: any) {
      console.error(error);
      showMessage(error.message || t("operator.error.updateFailed"), "error");
    }
  };

  const removePoint = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/charging-points/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to remove charging point");
      }

      showMessage(t("operator.success.removed"));
      fetchChargingPoints();
    } catch (error: any) {
      console.error(error);
      showMessage(error.message || t("operator.error.removeFailed"), "error");
    }
  };

  const toggleAccessibility = (option: string) => {
    setForm((prev) => ({
      ...prev,
      accessibility: prev.accessibility.includes(option)
        ? prev.accessibility.filter((a) => a !== option)
        : [...prev.accessibility, option],
    }));
  };

  const activeCount = points.filter((p) => p.is_operational).length;
  const suspendedCount = points.filter((p) => !p.is_operational).length;

  const inputStyle =
    "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900";

  return (
    <div className={cn("min-h-screen bg-gray-50 p-6", className)} {...props}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-medium text-gray-900">{t("operator.managementTitle")}</h1>
          <p className="text-sm text-gray-500 mt-1">{t("operator.managementSubtitle")}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: t("operator.stats.total"), value: points.length, color: "text-gray-900" },
            { label: t("operator.stats.active"), value: activeCount, color: "text-green-700" },
            { label: t("operator.stats.suspended"), value: suspendedCount, color: "text-red-700" },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-100 rounded-lg px-4 py-3">
              <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
              <p className={`text-2xl font-medium ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {statusMsg.type !== "idle" && (
          <div
            className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
              statusMsg.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {statusMsg.message}
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
            <h2 className="text-sm font-medium text-gray-900 mb-4">
              {editingId ? t("operator.editTitle") : t("operator.addTitle")}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">{t("operator.name")}</label>
                  <input
                    className={inputStyle}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={t("operator.namePlaceholder")}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">{t("operator.form.shorthandId")}</label>
                  <input
                    className={inputStyle}
                    value={form.id}
                    onChange={(e) => setForm({ ...form, id: e.target.value })}
                    placeholder="e.g. CP-004"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">{t("operator.location")}</label>
                  <input
                    className={inputStyle}
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder={t("operator.locationPlaceholder")}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">{t("operator.cost")}</label>
                  <input
                    className={inputStyle}
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: e.target.value })}
                    placeholder={t("operator.costPlaceholder")}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">{t("operator.form.latitude")}</label>
                  <input
                    className={inputStyle}
                    value={form.lat}
                    onChange={(e) => setForm({ ...form, lat: e.target.value })}
                    placeholder="e.g. 52.4862"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">{t("operator.form.longitude")}</label>
                  <input
                    className={inputStyle}
                    value={form.lng}
                    onChange={(e) => setForm({ ...form, lng: e.target.value })}
                    placeholder="e.g. -1.8904"
                  />
                </div>

                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-xs text-gray-500">{t("operator.form.accessibilityOptions")}</label>
                  <div
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      padding: "12px",
                      background: "#f9fafb",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {ACCESSIBILITY_OPTIONS.map((option) => (
                      <label
                        key={option}
                        style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
                      >
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
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.heic,.avif"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition"
                >
                  {editingId ? t("operator.saveChanges") : t("operator.addPoint")}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition"
                >
                  {t("operator.cancel")}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-700">{t("operator.list.title")}</span>
          {!showForm && (
            <button
              onClick={openAddForm}
              className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition text-gray-700"
            >
              {t("operator.addNew")}
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {points.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-sm text-gray-400">
              {t("operator.list.noPoints")}
            </div>
          )}

          {points.map((cp) => (
            <div key={cp.charging_point_id} className="bg-white rounded-xl border border-gray-100 p-5 hover:border-gray-200 transition">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{cp.charging_point_name || cp.shorthand_name}</p>
                  <p className="text-xs text-gray-400">{cp.shorthand_name}</p>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    cp.is_operational ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {cp.is_operational ? t("operator.status.active") : t("operator.status.suspended")}
                </span>
              </div>

              <div className="flex flex-col gap-1 mb-3">
                <p className="text-xs text-gray-500">
                  {t("operator.list.location", { location: cp.charging_point_location || "N/A" })}
                </p>
                <p className="text-xs text-gray-500">
                  {t("operator.list.accessibility", {
                    accessibility:
                      Array.isArray(cp.accessibility_features) && cp.accessibility_features.length > 0
                        ? cp.accessibility_features.join(", ")
                        : "N/A",
                  })}
                </p>
                <p className="text-xs text-gray-500">
                  {t("operator.list.cost", {
                    cost: cp.cost_per_kwh !== null ? `£${cp.cost_per_kwh}/kWh` : "N/A",
                  })}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEditForm(cp)}
                  className="px-3 py-1.5 text-xs font-medium border border-gray-200 bg-white text-gray-600 rounded-lg hover:bg-gray-50 transition"
                >
                  {t("operator.edit")}
                </button>
                <button
                  onClick={() => toggleSuspend(cp.charging_point_id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                    cp.is_operational
                      ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                      : "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                  }`}
                >
                  {cp.is_operational ? t("operator.suspend") : t("operator.reactivate")}
                </button>
                <button
                  onClick={() => removePoint(cp.charging_point_id)}
                  className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition"
                >
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