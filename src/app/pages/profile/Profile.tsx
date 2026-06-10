import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Profile() {
  // ---------------- PROFILE STATE ----------------
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    bloodGroup: "",
    allergies: "",
  });

  const [avatar, setAvatar] = useState("");
  const [message, setMessage] = useState("");

  // ---------------- LOAD DATA ON MOUNT ----------------
  useEffect(() => {
    const savedProfile = localStorage.getItem("profile");
    const savedUser = localStorage.getItem("afya_user");
    const savedAvatar = localStorage.getItem("avatar");

    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else if (savedUser) {
      const user = JSON.parse(savedUser);
      const [firstName, lastName] = (user.name || "").split(" ");

      setProfile((prev) => ({
        ...prev,
        firstName: firstName || "",
        lastName: lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }

    if (savedAvatar) {
      setAvatar(savedAvatar);
    }
  }, []);

  // ---------------- SAVE PROFILE ----------------
  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;

      if (!userId) throw new Error("No user logged in");

      if (!profile.firstName || !profile.lastName) {
        setMessage("First and last name are required");
        return;
      }

      if (!profile.bloodGroup) {
        setMessage("Please select a blood group");
        return;
      }

      const fullName = `${profile.firstName} ${profile.lastName}`;

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone: profile.phone,
          avatar_url: avatar,
        })
        .eq("id", userId)
        .select(); 

      console.log("PROFILE UPDATE:", profileData, profileError);

      await supabase
        .from("patients")
        .upsert({
          id: userId,
          date_of_birth: profile.dateOfBirth,
          blood_type: profile.bloodGroup,
          allergies: profile.allergies ? [profile.allergies] : [],
        });

      const { data: userData } = await supabase.auth.getUser();
      console.log("AUTH USER:", userData);

      setMessage("Profile saved successfully ✔");

    } catch (err) {
      console.error(err);
      setMessage("Failed to save profile to database");
    }
  };

  // ---------------- AVATAR UPLOAD ----------------
  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      const image = reader.result;

      setAvatar(image);
      localStorage.setItem("avatar", image);

      setMessage("Profile picture updated ✔");
      setTimeout(() => setMessage(""), 3000);
    };

    reader.readAsDataURL(file);
  };

  // ---------------- DELETE ACCOUNT ----------------
  const handleDeleteAccount = () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account?"
    );

    if (!confirmDelete) return;

    localStorage.removeItem("profile");
    localStorage.removeItem("afya_user");
    localStorage.removeItem("avatar");

    window.location.reload();
  };

  // ---------------- UI ----------------
  return (
    <div className="max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-600 mt-2">
          Manage your account information
        </p>
      </div>

      {/* MESSAGE */}
      {message && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm">{message}</p>
        </div>
      )}

      {/* CARD */}
      <div className="bg-white p-8 rounded-xl border border-slate-200">
        {/* AVATAR */}
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-200">
          <div className="w-24 h-24 rounded-full overflow-hidden border bg-slate-100 flex items-center justify-center">
            {avatar ? (
              <img
                src={avatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-white bg-blue-600 rounded-full p-2" />
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {profile.firstName || "User"} {profile.lastName}
            </h2>
            <p className="text-slate-600">Patient</p>

            {/* UPLOAD */}
            <label className="mt-2 inline-block cursor-pointer px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100">
              Change Photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </label>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* NAME */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-slate-700">
                First Name
              </label>
              <input
                value={profile.firstName}
                onChange={(e) =>
                  setProfile({ ...profile, firstName: e.target.value })
                }
                className="w-full mt-2 px-4 py-3 border rounded-lg"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Last Name
              </label>
              <input
                value={profile.lastName}
                onChange={(e) =>
                  setProfile({ ...profile, lastName: e.target.value })
                }
                className="w-full mt-2 px-4 py-3 border rounded-lg"
              />
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              value={profile.email}
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
              className="w-full mt-2 px-4 py-3 border rounded-lg"
            />
          </div>

          {/* PHONE */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Phone
            </label>
            <input
              value={profile.phone}
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
              className="w-full mt-2 px-4 py-3 border rounded-lg"
            />
          </div>

          {/* DOB */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Date of Birth
            </label>
            <input
              type="date"
              value={profile.dateOfBirth}
              onChange={(e) =>
                setProfile({ ...profile, dateOfBirth: e.target.value })
              }
              className="w-full mt-2 px-4 py-3 border rounded-lg"
            />
          </div>

          {/* ADDRESS */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Address
            </label>
            <textarea
              value={profile.address}
              onChange={(e) =>
                setProfile({ ...profile, address: e.target.value })
              }
              className="w-full mt-2 px-4 py-3 border rounded-lg"
            />
          </div>

          {/* BLOOD GROUP */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Blood Group
            </label>
            <select
              value={profile.bloodGroup}
              onChange={(e) =>
                setProfile({ ...profile, bloodGroup: e.target.value })
              }
              className="w-full mt-2 px-4 py-3 border rounded-lg"
            >
              <option value="">Select</option>
              <option>A+</option>
              <option>A-</option>
              <option>B+</option>
              <option>B-</option>
              <option>AB+</option>
              <option>AB-</option>
              <option>O+</option>
              <option>O-</option>
            </select>
          </div>

          {/* ALLERGIES */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Allergies
            </label>
            <input
              value={profile.allergies}
              onChange={(e) =>
                setProfile({ ...profile, allergies: e.target.value })
              }
              className="w-full mt-2 px-4 py-3 border rounded-lg"
            />
          </div>

          {/* BUTTONS */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors duration-200"
            >
              <Save className="w-5 h-5" />
              Save Changes
            </button>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-3 border rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* SECURITY (RESTORED EXACTLY) */}
      <div className="mt-6 bg-white p-8 rounded-xl border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-6">
          Security Settings
        </h2>

        <div className="space-y-4">
          <button className="w-full py-3 bg-slate-100 rounded-lg text-left px-4">
            Change Password
          </button>

          <button className="w-full py-3 bg-red-50 text-red-600 rounded-lg text-left px-4">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}