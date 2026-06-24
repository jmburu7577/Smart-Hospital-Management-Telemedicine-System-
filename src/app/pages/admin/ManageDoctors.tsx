import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Stethoscope,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import type { DoctorProfile } from "../../types/database";

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"full_name" | "specialty" | "created_at">("full_name");
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Join profiles + doctors
        const { data, error } = await supabase
          .from("profiles")
          .select(`
            id, full_name, email, phone, role, avatar_url, created_at, updated_at,
            doctors (specialty, available_days, license_number)
          `)
          .eq("role", "doctor")
          .order("full_name", { ascending: true });

        if (error) {
          console.error("Error fetching doctors:", error);
          return;
        }

        // Flatten nested doctors relation
        const flat = (data ?? []).map((row: any) => ({
          ...row,
          specialty: row.doctors?.specialty ?? "N/A",
          available_days: row.doctors?.available_days ?? [],
          license_number: row.doctors?.license_number ?? null,
        })) as DoctorProfile[];

        setDoctors(flat);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = doctors
    .filter((d) => {
      const q = search.toLowerCase();
      return (
        d.full_name?.toLowerCase().includes(q) ||
        d.email?.toLowerCase().includes(q) ||
        d.specialty?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const av = (a[sortField] ?? "") as string;
      const bv = (b[sortField] ?? "") as string;
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortAsc((v) => !v);
    else { setSortField(field); setSortAsc(true); }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) =>
    sortField === field ? (
      sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
    ) : null;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manage Doctors</h1>
            <p className="text-sm text-slate-500">
              {doctors.length} doctor{doctors.length !== 1 ? "s" : ""} registered
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, email or specialty…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-slate-400">Loading doctors…</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No doctors match your search.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <button
                    onClick={() => toggleSort("full_name")}
                    className="flex items-center gap-1 hover:text-slate-700"
                  >
                    Doctor <SortIcon field="full_name" />
                  </button>
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <button
                    onClick={() => toggleSort("specialty")}
                    className="flex items-center gap-1 hover:text-slate-700"
                  >
                    Specialty <SortIcon field="specialty" />
                  </button>
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Available Days
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  License
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <button
                    onClick={() => toggleSort("created_at")}
                    className="flex items-center gap-1 hover:text-slate-700"
                  >
                    Joined <SortIcon field="created_at" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((doctor) => (
                <tr key={doctor.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Stethoscope className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {doctor.full_name ?? "—"}
                        </p>
                        <p className="text-xs text-slate-500">{doctor.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      <BadgeCheck className="w-3 h-3" />
                      {doctor.specialty}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(doctor.available_days ?? []).map((day) => (
                        <span
                          key={day}
                          className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-slate-100 text-slate-600"
                        >
                          {day}
                        </span>
                      ))}
                      {(!doctor.available_days || doctor.available_days.length === 0) && (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600 text-xs font-mono">
                    {doctor.license_number ?? "—"}
                  </td>
                  <td className="px-5 py-4 text-slate-500 text-xs">
                    {new Date(doctor.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
