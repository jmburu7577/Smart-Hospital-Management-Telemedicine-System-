import { useState } from "react";
import { Link } from "react-router";
import {
  Video, Calendar, Clock, CheckCircle,
  Star, ChevronRight, Wifi, Mic, Camera,
  FileText, Bell, Search, X,
  type LucideIcon,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  available: boolean;
  avatar: string;
  color: string;
  nextSlot: string;
}

interface Consultation {
  id: number;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  status: string;
  avatar: string;
  color: string;
  minutesUntil: number | null;
}

interface Step {
  icon: LucideIcon;
  label: string;
  desc: string;
}

interface AvatarProps {
  initials: string;
  color: string;
  size?: number;
}

interface StatusBadgeProps {
  status: string;
  minutesUntil: number | null;
}

// ── Data ─────────────────────────────────────────────────────────────────────

const doctors: Doctor[] = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "General Practice",
    rating: 4.9,
    reviews: 214,
    available: true,
    avatar: "SJ",
    color: "#0EA5E9",
    nextSlot: "Today, 3:00 PM",
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "Cardiology",
    rating: 4.8,
    reviews: 189,
    available: true,
    avatar: "MC",
    color: "#10B981",
    nextSlot: "Today, 4:30 PM",
  },
  {
    id: 3,
    name: "Dr. Amara Osei",
    specialty: "Dermatology",
    rating: 4.7,
    reviews: 143,
    available: false,
    avatar: "AO",
    color: "#F59E0B",
    nextSlot: "Tomorrow, 9:00 AM",
  },
  {
    id: 4,
    name: "Dr. Lisa Mwangi",
    specialty: "Pediatrics",
    rating: 4.9,
    reviews: 301,
    available: true,
    avatar: "LM",
    color: "#8B5CF6",
    nextSlot: "Today, 5:00 PM",
  },
];

const upcomingConsultations: Consultation[] = [
  {
    id: 1,
    doctor: "Dr. Sarah Johnson",
    specialty: "General Practice",
    date: "May 26, 2026",
    time: "10:00 AM",
    status: "Upcoming",
    avatar: "SJ",
    color: "#0EA5E9",
    minutesUntil: 47,
  },
  {
    id: 2,
    doctor: "Dr. Michael Chen",
    specialty: "Cardiology",
    date: "May 28, 2026",
    time: "2:30 PM",
    status: "Scheduled",
    avatar: "MC",
    color: "#10B981",
    minutesUntil: null,
  },
];

const steps: Step[] = [
  { icon: Calendar, label: "Schedule", desc: "Book a slot with your preferred doctor" },
  { icon: Bell,     label: "Confirm",  desc: "Get notified via email and SMS" },
  { icon: Video,    label: "Join call", desc: "Connect at your scheduled time" },
  { icon: FileText, label: "Get Rx",   desc: "Receive digital prescriptions" },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function Avatar({ initials, color, size = 40 }: AvatarProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color + "22",
        border: `1.5px solid ${color}44`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.32,
        fontWeight: 600,
        color,
        flexShrink: 0,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {initials}
    </div>
  );
}

function StatusBadge({ status, minutesUntil }: StatusBadgeProps) {
  if (minutesUntil !== null && minutesUntil !== undefined) {
    return (
      <span
        style={{
          background: "#FEF3C7",
          color: "#92400E",
          fontSize: 11,
          fontWeight: 600,
          padding: "3px 10px",
          borderRadius: 999,
          whiteSpace: "nowrap",
        }}
      >
        In {minutesUntil}m
      </span>
    );
  }
  return (
    <span
      style={{
        background: "#D1FAE5",
        color: "#065F46",
        fontSize: 11,
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: 999,
      }}
    >
      {status}
    </span>
  );
}

// ── Page component ────────────────────────────────────────────────────────────

export default function Telemedicine() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterAvailable, setFilterAvailable] = useState<boolean>(false);

  const filteredDoctors = doctors.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterAvailable ? d.available : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "2rem 1.5rem",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Google fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display&display=swap');
        * { box-sizing: border-box; }
        .tele-btn-primary {
          background: #0EA5E9; color: #fff; border: none;
          padding: 10px 22px; border-radius: 10px;
          font-size: 14px; font-weight: 600; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.15s, transform 0.1s;
        }
        .tele-btn-primary:hover { background: #0284C7; transform: translateY(-1px); }
        .doctor-card {
          background: #fff; border: 1px solid #E2E8F0;
          border-radius: 14px; padding: 18px;
          transition: box-shadow 0.2s, transform 0.15s;
        }
        .doctor-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); transform: translateY(-2px); }
        .tab-btn {
          padding: 7px 18px; border-radius: 8px; border: none;
          font-size: 13px; font-weight: 500; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.15s, color 0.15s;
        }
        .tab-btn.active { background: #0EA5E9; color: #fff; }
        .tab-btn:not(.active) { background: #F1F5F9; color: #64748B; }
        .tab-btn:not(.active):hover { background: #E2E8F0; color: #334155; }
        input[type="text"] {
          font-family: 'DM Sans', sans-serif;
          border: 1px solid #E2E8F0; border-radius: 10px;
          padding: 9px 14px 9px 38px; font-size: 13px;
          outline: none; width: 100%;
          transition: border-color 0.15s;
        }
        input[type="text"]:focus { border-color: #0EA5E9; }
        .check-pill {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 8px; border: 1px solid #E2E8F0;
          font-size: 13px; font-weight: 500; cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
          font-family: 'DM Sans', sans-serif; white-space: nowrap;
          user-select: none;
        }
        .check-pill.on { background: #F0F9FF; border-color: #BAE6FD; color: #0284C7; }
        .check-pill:not(.on) { color: #64748B; }
      `}</style>

      {/* Page header */}
      <div style={{ marginBottom: "1.75rem" }}>
        <h1
          style={{
            fontSize: 28,
            fontFamily: "'DM Serif Display', serif",
            color: "#0F172A",
            margin: 0,
          }}
        >
          Telemedicine
        </h1>
        <p style={{ fontSize: 14, color: "#64748B", marginTop: 6 }}>
          Connect with certified doctors from wherever you are
        </p>
      </div>

      {/* Hero banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #0369A1 0%, #0EA5E9 60%, #38BDF8 100%)",
          borderRadius: 20,
          padding: "2rem 2.25rem",
          marginBottom: "2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1.5rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute", right: -40, top: -40,
            width: 200, height: 200, borderRadius: "50%",
            background: "rgba(255,255,255,0.06)", pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute", right: 60, bottom: -60,
            width: 160, height: 160, borderRadius: "50%",
            background: "rgba(255,255,255,0.05)", pointerEvents: "none",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <div
            style={{
              width: 60, height: 60, borderRadius: "50%",
              background: "rgba(255,255,255,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Video size={28} color="#fff" />
          </div>
          <div>
            <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 600, margin: 0 }}>
              Start a Video Consultation
            </h2>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 4 }}>
              Speak to a doctor in minutes — no waiting room required
            </p>
            <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
              {(
                [
                  { icon: Wifi,   label: "HD Video" },
                  { icon: Mic,    label: "Clear Audio" },
                  { icon: Camera, label: "Screen Share" },
                ] as { icon: LucideIcon; label: string }[]
              ).map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    fontSize: 12, color: "rgba(255,255,255,0.85)",
                  }}
                >
                  <Icon size={13} /> {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <Link
          to="/appointments/book"
          style={{
            background: "#fff", color: "#0369A1",
            padding: "11px 26px", borderRadius: 12,
            fontWeight: 700, fontSize: 14, textDecoration: "none",
            display: "inline-block", whiteSpace: "nowrap",
          }}
        >
          Schedule Consultation
        </Link>
      </div>

      {/* How it works */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          marginBottom: "2rem",
        }}
      >
        {steps.map(({ icon: Icon, label, desc }, i) => (
          <div
            key={label}
            style={{
              background: "#F8FAFC", border: "1px solid #E2E8F0",
              borderRadius: 14, padding: "16px 14px",
              display: "flex", flexDirection: "column", gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "#E0F2FE",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <Icon size={15} color="#0284C7" />
              </div>
              <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600 }}>
                Step {i + 1}
              </span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1E293B" }}>{label}</div>
            <div style={{ fontSize: 12, color: "#64748B", lineHeight: 1.5 }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* Main two-column section */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>

        {/* Left: My Consultations */}
        <div
          style={{
            background: "#fff", border: "1px solid #E2E8F0",
            borderRadius: 16, padding: "1.25rem",
          }}
        >
          <div
            style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between", marginBottom: "1rem",
            }}
          >
            <h2 style={{ fontSize: 15, fontWeight: 600, color: "#0F172A", margin: 0 }}>
              My Consultations
            </h2>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                className={`tab-btn${activeTab === "upcoming" ? " active" : ""}`}
                onClick={() => setActiveTab("upcoming")}
              >
                Upcoming
              </button>
              <button
                className={`tab-btn${activeTab === "past" ? " active" : ""}`}
                onClick={() => setActiveTab("past")}
              >
                Past
              </button>
            </div>
          </div>

          {activeTab === "upcoming" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {upcomingConsultations.map((c) => (
                <div
                  key={c.id}
                  style={{
                    background: "#F8FAFC", border: "1px solid #E2E8F0",
                    borderRadius: 12, padding: "14px",
                  }}
                >
                  <div
                    style={{
                      display: "flex", alignItems: "flex-start",
                      justifyContent: "space-between", marginBottom: 10,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar initials={c.avatar} color={c.color} size={38} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>
                          {c.doctor}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748B" }}>{c.specialty}</div>
                      </div>
                    </div>
                    <StatusBadge status={c.status} minutesUntil={c.minutesUntil} />
                  </div>

                  <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                    <span
                      style={{
                        display: "flex", alignItems: "center", gap: 5,
                        fontSize: 12, color: "#64748B",
                      }}
                    >
                      <Calendar size={13} /> {c.date}
                    </span>
                    <span
                      style={{
                        display: "flex", alignItems: "center", gap: 5,
                        fontSize: 12, color: "#64748B",
                      }}
                    >
                      <Clock size={13} /> {c.time}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <Link
                      to={`/telemedicine/consultation/${c.id}`}
                      style={{
                        flex: 1, display: "block", textAlign: "center",
                        padding: "9px", background: "#0EA5E9", color: "#fff",
                        borderRadius: 10, fontSize: 13, fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      <Video size={13} style={{ verticalAlign: -2, marginRight: 5 }} />
                      Join Call
                    </Link>
                    <button
                      style={{
                        padding: "9px 14px", border: "1px solid #E2E8F0",
                        borderRadius: 10, background: "transparent",
                        cursor: "pointer", color: "#64748B",
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}

              <Link
                to="/appointments/book"
                style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 6,
                  padding: "10px", border: "1.5px dashed #BAE6FD",
                  borderRadius: 12, color: "#0284C7",
                  fontSize: 13, fontWeight: 500, textDecoration: "none",
                }}
              >
                + Book another consultation
              </Link>
            </div>
          ) : (
            <div
              style={{
                textAlign: "center", padding: "2.5rem 1rem",
                color: "#94A3B8", fontSize: 14,
              }}
            >
              <CheckCircle
                size={36}
                style={{ margin: "0 auto 10px", display: "block", color: "#CBD5E1" }}
              />
              No past consultations yet
            </div>
          )}
        </div>

        {/* Right: Find a Doctor */}
        <div
          style={{
            background: "#fff", border: "1px solid #E2E8F0",
            borderRadius: 16, padding: "1.25rem",
          }}
        >
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "#0F172A", margin: "0 0 1rem" }}>
            Find a Doctor
          </h2>

          <div style={{ display: "flex", gap: 8, marginBottom: "1rem" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search
                size={14}
                color="#94A3B8"
                style={{
                  position: "absolute", left: 12,
                  top: "50%", transform: "translateY(-50%)",
                }}
              />
              <input
                type="text"
                placeholder="Search by name or specialty…"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
              />
            </div>
            <div
              className={`check-pill${filterAvailable ? " on" : ""}`}
              onClick={() => setFilterAvailable((prev) => !prev)}
            >
              <div
                style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: filterAvailable ? "#10B981" : "#CBD5E1",
                }}
              />
              Available
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filteredDoctors.length === 0 ? (
              <div
                style={{
                  textAlign: "center", padding: "2rem",
                  color: "#94A3B8", fontSize: 13,
                }}
              >
                No doctors match your search
              </div>
            ) : (
              filteredDoctors.map((doc) => (
                <div key={doc.id} className="doctor-card">
                  <div
                    style={{
                      display: "flex", alignItems: "center",
                      gap: 10, marginBottom: 10,
                    }}
                  >
                    <Avatar initials={doc.avatar} color={doc.color} size={40} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span
                          style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}
                        >
                          {doc.name}
                        </span>
                        {doc.available && (
                          <span
                            style={{
                              width: 7, height: 7, borderRadius: "50%",
                              background: "#10B981", display: "inline-block",
                            }}
                          />
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748B" }}>{doc.specialty}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          display: "flex", alignItems: "center",
                          gap: 3, justifyContent: "flex-end",
                        }}
                      >
                        <Star size={11} color="#F59E0B" fill="#F59E0B" />
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#1E293B" }}>
                          {doc.rating}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: "#94A3B8" }}>
                        {doc.reviews} reviews
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex", alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color: doc.available ? "#059669" : "#94A3B8",
                        display: "flex", alignItems: "center", gap: 4,
                      }}
                    >
                      <Clock size={12} />
                      {doc.nextSlot}
                    </span>
                    <Link
                      to={`/appointments/book?doctor=${doc.id}`}
                      style={{
                        display: "flex", alignItems: "center", gap: 4,
                        fontSize: 12, fontWeight: 600, color: "#0284C7",
                        textDecoration: "none", padding: "6px 12px",
                        border: "1px solid #BAE6FD", borderRadius: 8,
                      }}
                    >
                      Book <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
