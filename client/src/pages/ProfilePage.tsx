import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authClient } from "../lib/auth-client";

interface UserProfile {
  name: string;
  email: string;
  publicName: string | null;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ message: string; type: "error" | "success"; } | null>(null);

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      const { data: session, error } = await authClient.getSession();

      if (error || !session) {
        navigate("/");
        return;
      }

      setProfile({
        name: session.user.name,
        email: session.user.email,
        publicName: (session.user as any).publicName || null,
      });
    } catch (err: any) {
      console.error(err);
      setStatus({ message: "Failed to load profile details", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setSaving(true);

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const publicName = (formData.get("public_name") as string) || null;

    try {
      const { error } = await authClient.updateUser({
        name,
        publicName
      } as any);

      if (error) {
        throw new Error(error.message || "Failed to update profile");
      }

      const updatedSessionData = await authClient.getSession();

      if (updatedSessionData.error || !updatedSessionData.data) {
        throw new Error(updatedSessionData.error?.message || "Failed to update profile");
      }

      setProfile({
        name: updatedSessionData.data.user.name,
        email: updatedSessionData.data.user.email,
        publicName: (updatedSessionData.data.user as any).publicName || null,
      });

      setStatus({ message: "Profile updated successfully!", type: "success" });
    } catch (err: any) {
      setStatus({ message: err.message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate("/");
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-5 text-center">
        <h1 className="text-4xl font-semibold mb-5">My Profile</h1>
        <p className="text-lg mb-4">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-5 text-center">
        <h1 className="text-4xl font-semibold mb-5">My Profile</h1>
        <p className="text-lg mb-4">Could not load profile. Please try logging in again</p>
        <button
          onClick={() => navigate("/")}
          className="px-5 py-2 m-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-base cursor-pointer"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-5 text-center w-full max-w-3xl mx-auto">
      <h1 className="text-4xl font-semibold mb-5">My Profile</h1>

      <form onSubmit={handleUpdate} className="flex flex-col w-full gap-4">
        <div className="flex flex-col w-full gap-3 text-left">
          <div className="flex flex-col">
            <label htmlFor="email" className="block mb-1 font-bold">Email</label>
            <p className="text-sm text-gray-500 -mt-1 mb-1">Your email address cannot be changed</p>
            <input
              id="email"
              name="email"
              type="email"
              value={profile.email}
              disabled
              className="w-full px-3.5 py-2.5 my-2 border border-gray-300 rounded-md text-base bg-gray-200 cursor-not-allowed focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="name" className="block mb-1 font-bold">Username</label>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={profile.name}
              required
              disabled={saving}
              className="w-full px-3.5 py-2.5 my-2 border border-gray-300 rounded-md text-base focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="public_name" className="block mb-1 font-bold">Display Name</label>
            <input
              id="public_name"
              name="public_name"
              type="text"
              defaultValue={profile.publicName || ""}
              disabled={saving}
              placeholder="Optional"
              className="w-full px-3.5 py-2.5 my-2 border border-gray-300 rounded-md text-base focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
          </div>
        </div>

        {status && (
          <p className={`text-center my-2 ${status.type === "error" ? "text-red-500" : "text-green-500"}`}>
            {status.message}
          </p>
        )}

        <div className="flex w-full gap-3 mt-3 flex-col sm:flex-row">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-5 py-2.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed m-0"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/routing")}
            disabled={saving}
            className="flex-1 px-5 py-2.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed m-0"
          >
            Back to Map
          </button>
          <button
            type="button"
            onClick={handleLogout}
            disabled={saving}
            className="flex-1 px-5 py-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed m-0"
          >
            Log out
          </button>
        </div>
      </form>
    </div>
  );
}
