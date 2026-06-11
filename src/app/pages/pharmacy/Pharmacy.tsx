import { useState } from "react";
import { Link } from "react-router";
import {
  Pill, CheckCircle, Clock, AlertCircle,
  Search, RefreshCw, ChevronRight, Calendar,
  User, Package, Filter, X,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type PrescriptionStatus = "Ready for Pickup" | "Processing" | "Dispensed" | "Refill Due";

interface Prescription {
  id: number;
  medication: string;
  doctor: string;
  status: PrescriptionStatus;
  date: string;
  dosage: string;
  frequency: string;
  refillsLeft: number;
  pharmacy: string;
}

// ── Data ──────────────────────────────────────────────────────────────────────

const prescriptions: Prescription[] = [
  {
    id: 1,
    medication: "Amoxicillin 500mg",
    doctor: "Dr. Sarah Johnson",
    status: "Ready for Pickup",
    date: "May 15, 2026",
    dosage: "500mg",
    frequency: "3x daily for 7 days",
    refillsLeft: 0,
    pharmacy: "Nakuru General Pharmacy",
  },
  {
    id: 2,
    medication: "Lisinopril 10mg",
    doctor: "Dr. Michael Chen",
    status: "Processing",
    date: "May 18, 2026",
    dosage: "10mg",
    frequency: "Once daily",
    refillsLeft: 2,
    pharmacy: "Nakuru General Pharmacy",
  },
  {
    id: 3,
    medication: "Metformin 850mg",
    doctor: "Dr. Emily Davis",
    status: "Dispensed",
    date: "May 10, 2026",
    dosage: "850mg",
    frequency: "Twice daily with meals",
    refillsLeft: 3,
    pharmacy: "Rift Valley Pharmacy",
  },
  {
    id: 4,
    medication: "Amlodipine 5mg",
    doctor: "Dr. Sarah Johnson",
    status: "Refill Due",
    date: "Apr 28, 2026",
    dosage: "5mg",
    frequency: "Once daily",
    refillsLeft: 1,
    pharmacy: "Nakuru General Pharmacy",
  },
  {
    id: 5,
    medication: "Atorvastatin 20mg",
    doctor: "Dr. Michael Chen",
    status: "Dispensed",
    date: "Apr 20, 2026",
    dosage: "20mg",
    frequency: "Once daily at night",
    refillsLeft: 2,
    pharmacy: "Rift Valley Pharmacy",
  },
];

// ── Config ────────────────────────────────────────────────────────────────────

const statusConfig: Record<PrescriptionStatus, {
  label: string; bg: string; color: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
}> = {
  "Ready for Pickup": { label: "Ready for Pickup", bg: "#D1FAE5", color: "#065F46", icon: CheckCircle  },
  "Processing":       { label: "Processing",        bg: "#FEF3C7", color: "#92400E", icon: Clock        },
  "Dispensed":        { label: "Dispensed",          bg: "#DBEAFE", color: "#1E40AF", icon: Package      },
  "Refill Due":       { label: "Refill Due",         bg: "#FEE2E2", color: "#991B1B", icon: AlertCircle  },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Pharmacy() {
  const [searchQuery, setSearchQuery]     = useState<string>("");
  const [statusFilter, setStatusFilter]   = useState<PrescriptionStatus | "all">("all");
  const [expandedId, setExpandedId]       = useState<number | null>(null);

  const filtered = prescriptions.filter((p) => {
    const matchesSearch =
      p.medication.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.doctor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const readyCount   = prescriptions.filter((p) => p.status === "Ready for Pickup").length;
  const processingCount = prescriptions.filter((p) => p.status === "Processing").length;
  const refillDueCount  = prescriptions.filter((p) => p.status === "Refill Due").length;

  return (
    <div
      style={{
        maxWidth: 1000,
        margin: "0 auto",
        padding: "2rem 1.5rem",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display&display=swap');
        * { box-sizing: border-box; }
        .search-input {
          font-family: 'DM Sans', sans-serif;
          border: 1px solid #E2E8F0; border-radius: 10px;
          padding: 9px 14px 9px 38px; font-size: 13px;
          outline: none; width: 100%;
          transition: border-color 0.15s; background: #fff;
        }
        .search-input:focus { border-color: #0EA5E9; }
        .status-select {
          font-family: 'DM Sans', sans-serif;
          border: 1px solid #E2E8F0; border-radius: 10px;
          padding: 9px 14px; font-size: 13px; outline: none;
          background: #fff; color: #374151; cursor: pointer;
        }
        .rx-row {
          border-bottom: 1px solid #F1F5F9;
          transition: background 0.12s;
        }
        .rx-row:last-child { border-bottom: none; }
        .rx-row:hover { background: #F8FAFC; }
        .action-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 10px;
          font-size: 12px; font-weight: 600; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.15s; border: none;
        }
        .btn-primary { background: #0EA5E9; color: #fff; }
        .btn-primary:hover { background: #0284C7; }
        .btn-outline { background: #fff; color: #374151; border: 1px solid #E2E8F0 !important; }
        .btn-outline:hover { background: #F8FAFC; }
        .btn-danger { background: #FEF3C7; color: #92400E; }
        .btn-danger:hover { background: #FDE68A; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: 28, fontFamily: "'DM Serif Display', serif", color: "#0F172A", margin: 0 }}>
          Pharmacy
        </h1>
        <p style={{ fontSize: 14, color: "#64748B", marginTop: 6 }}>
          Manage your prescriptions and medication refills
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: "1.5rem" }}>
        {[
          { label: "Active prescriptions", value: prescriptions.length,  color: "#0F172A", bg: "#F8FAFC"  },
          { label: "Ready for pickup",     value: readyCount,            color: "#065F46", bg: "#D1FAE5"  },
          { label: "Processing",           value: processingCount,       color: "#92400E", bg: "#FEF3C7"  },
          { label: "Refill due",           value: refillDueCount,        color: "#991B1B", bg: "#FEE2E2"  },
        ].map(({ label, value, color, bg }) => (
          <div
            key={label}
            style={{
              background: bg, border: "1px solid #E2E8F0",
              borderRadius: 12, padding: "1rem",
            }}
          >
            <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 26, fontWeight: 600, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Refill due alert */}
      {refillDueCount > 0 && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "#FEE2E2", border: "1px solid #FECACA",
          borderRadius: 12, padding: "12px 16px", marginBottom: "1.5rem",
        }}>
          <AlertCircle size={16} color="#DC2626" />
          <span style={{ fontSize: 13, color: "#991B1B", fontWeight: 500 }}>
            You have {refillDueCount} prescription{refillDueCount > 1 ? "s" : ""} due for refill. Request a refill before you run out.
          </span>
          <button
            onClick={() => setStatusFilter("Refill Due")}
            style={{
              marginLeft: "auto", fontSize: 12, fontWeight: 600,
              color: "#DC2626", background: "transparent", border: "none",
              cursor: "pointer", textDecoration: "underline",
            }}
          >
            View now
          </button>
        </div>
      )}

      {/* Search + filter */}
      <div style={{ display: "flex", gap: 10, marginBottom: "1.25rem" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search
            size={14}
            color="#94A3B8"
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            className="search-input"
            type="text"
            placeholder="Search by medication or doctor…"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="status-select"
          value={statusFilter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setStatusFilter(e.target.value as PrescriptionStatus | "all")
          }
        >
          <option value="all">All statuses</option>
          <option value="Ready for Pickup">Ready for Pickup</option>
          <option value="Processing">Processing</option>
          <option value="Dispensed">Dispensed</option>
          <option value="Refill Due">Refill Due</option>
        </select>
        {statusFilter !== "all" && (
          <button
            className="action-btn btn-outline"
            onClick={() => setStatusFilter("all")}
          >
            <X size={13} /> Clear
          </button>
        )}
      </div>

      {/* Prescriptions list */}
      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, overflow: "hidden" }}>
        <div style={{
          padding: "14px 16px",
          borderBottom: "1px solid #F1F5F9",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>
            My Prescriptions
          </span>
          <span style={{ fontSize: 12, color: "#94A3B8" }}>
            {filtered.length} of {prescriptions.length} shown
          </span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#94A3B8" }}>
            <Pill size={36} style={{ margin: "0 auto 12px", display: "block", color: "#CBD5E1" }} />
            <p style={{ fontSize: 14 }}>No prescriptions match your search</p>
          </div>
        ) : (
          filtered.map((rx) => {
            const cfg        = statusConfig[rx.status];
            const StatusIcon = cfg.icon;
            const isExpanded = expandedId === rx.id;

            return (
              <div key={rx.id} className="rx-row">
                {/* Main row */}
                <div
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 16px", cursor: "pointer",
                  }}
                  onClick={() => setExpandedId(isExpanded ? null : rx.id)}
                >
                  {/* Icon */}
                  <div style={{
                    width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                    background: "#EFF6FF",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Pill size={20} color="#3B82F6" />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", marginBottom: 2 }}>
                      {rx.medication}
                    </div>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#64748B" }}>
                        <User size={11} /> {rx.doctor}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#94A3B8" }}>
                        <Calendar size={11} /> {rx.date}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <span style={{
                    display: "flex", alignItems: "center", gap: 5,
                    background: cfg.bg, color: cfg.color,
                    fontSize: 11, fontWeight: 600,
                    padding: "4px 10px", borderRadius: 999, whiteSpace: "nowrap",
                  }}>
                    <StatusIcon size={11} color={cfg.color} />
                    {cfg.label}
                  </span>

                  {/* Actions */}
                  <div
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  >
                    {rx.status === "Ready for Pickup" && (
                      <button className="action-btn btn-primary">
                        <CheckCircle size={13} /> Collect Now
                      </button>
                    )}
                    {rx.status === "Refill Due" && (
                      <button className="action-btn btn-danger">
                        <RefreshCw size={13} /> Request Refill
                      </button>
                    )}
                  </div>

                  <ChevronRight
                    size={16}
                    color="#CBD5E1"
                    style={{
                      transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                      flexShrink: 0,
                    }}
                  />
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div style={{
                    padding: "0 16px 16px 72px",
                    borderTop: "1px solid #F1F5F9",
                  }}>
                    <div style={{
                      display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
                      gap: 12, marginTop: 14,
                    }}>
                      {[
                        { label: "Dosage",      value: rx.dosage      },
                        { label: "Frequency",   value: rx.frequency   },
                        { label: "Refills left",value: `${rx.refillsLeft} remaining` },
                        { label: "Pharmacy",    value: rx.pharmacy    },
                      ].map(({ label, value }) => (
                        <div key={label} style={{
                          background: "#F8FAFC", border: "1px solid #E2E8F0",
                          borderRadius: 10, padding: "10px 12px",
                        }}>
                          <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 3 }}>{label}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{value}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button className="action-btn btn-outline">
                        <RefreshCw size={13} /> Request Refill
                      </button>
                      <Link
                        to="/medical-records"
                        className="action-btn btn-outline"
                        style={{ textDecoration: "none" }}
                      >
                        View in Records
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}