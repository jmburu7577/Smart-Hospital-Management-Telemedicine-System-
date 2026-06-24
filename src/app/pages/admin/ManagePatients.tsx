import { useState, useEffect } from "react";
import {
  Users,
  Search,
  User,
  Droplets,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import type { PatientProfile } from "../../types/database";

export default function ManagePatients() {
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"full_name" | "created_at">("full_name");
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Join profiles + patients
        const { data, error } = await supabase
          .from("profiles")
          .select(`
            id, full_name, email, phone, role, avatar_url, created_at, updated_at,
            patients (date_of_birth, blood_type, allergies, medical_conditions)
          `)
          .eq("role", "patient")
          .order("full_name", { ascending: true });

        if (error) {
          console.error("Error fetching patients:", error);
          return;
        }

        const flat = (data ?? []).map((row: any) => ({
          ...row,
          date_of_birth: row.patients?.date_of_birth ?? null,
          blood_type: row.patients?.blood_type ?? null,
          allergies: row.patients?.allergies ?? [],
          medical_conditions: row.patients?.medical_conditions ?? [],
        })) as PatientProfile[];

        setPatients(flat);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = patients
    .filter((p) => {
      const q = search.toLowerCase();
      return (
        p.full_name?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.blood_type?.toLowerCase().includes(q)
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

  function calcAge(dob: string | null): string {
    if (!dob) return "—";
    const diff = Date.now() - new Date(dob).getTime();
    const age = Math.floor(diff / (365.25 * 24 * 3600 * 1000));
    return `${age} yrs`;
  }

  const bloodTypeColors: Record<string, string> = {
    "A+": "bg-red-50 text-red-700",
    "A-": "bg-red-50 text-red-700",
    "B+": "bg-orange-50 text-orange-700",
    "B-": "bg-orange-50 text-orange-700",
    "O+": "bg-green-50 text-green-700",
    "O-": "bg-green-50 text-green-700",
    "AB+": "bg-purple-50 text-purple-700",
    "AB-": "bg-purple-50 text-purple-700",
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
          <Users className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Patients</h1>
          <p className="text-sm text-slate-500">
            {patients.length} patient{patients.length !== 1 ? "s" : ""} registered
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, email or blood type…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-slate-400">Loading patients…</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No patients match your search.</p>
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
                    Patient <SortIcon field="full_name" />
                  </button>
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Age / DOB
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Blood Type
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Allergies
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Conditions
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
              {filtered.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {patient.full_name ?? "—"}
                        </p>
                        <p className="text-xs text-slate-500">{patient.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    <p className="font-medium">{calcAge(patient.date_of_birth)}</p>
                    {patient.date_of_birth && (
                      <p className="text-xs text-slate-400">
                        {new Date(patient.date_of_birth).toLocaleDateString()}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {patient.blood_type ? (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          bloodTypeColors[patient.blood_type] ?? "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Droplets className="w-3 h-3" />
                        {patient.blood_type}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(patient.allergies ?? []).slice(0, 3).map((a) => (
                        <span
                          key={a}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-600"
                        >
                          <AlertTriangle className="w-2.5 h-2.5" />
                          {a}
                        </span>
                      ))}
                      {(patient.allergies?.length ?? 0) > 3 && (
                        <span className="text-[10px] text-slate-400">
                          +{(patient.allergies?.length ?? 0) - 3} more
                        </span>
                      )}
                      {(!patient.allergies || patient.allergies.length === 0) && (
                        <span className="text-slate-400 text-xs">None</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(patient.medical_conditions ?? []).slice(0, 2).map((c) => (
                        <span
                          key={c}
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700"
                        >
                          {c}
                        </span>
                      ))}
                      {(patient.medical_conditions?.length ?? 0) > 2 && (
                        <span className="text-[10px] text-slate-400">
                          +{(patient.medical_conditions?.length ?? 0) - 2} more
                        </span>
                      )}
                      {(!patient.medical_conditions || patient.medical_conditions.length === 0) && (
                        <span className="text-slate-400 text-xs">None</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-500 text-xs">
                    {new Date(patient.created_at).toLocaleDateString()}
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
