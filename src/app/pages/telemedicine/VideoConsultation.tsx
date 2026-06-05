import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Video, VideoOff, Mic, MicOff, PhoneOff,
  MessageSquare, Users, Settings, Maximize2,
  Send, X, ChevronDown,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: number;
  sender: "doctor" | "patient";
  text: string;
  time: string;
}

interface Participant {
  name: string;
  role: string;
  initials: string;
  color: string;
}

// ── Data ──────────────────────────────────────────────────────────────────────

const doctor: Participant = {
  name: "Dr. Sarah Johnson",
  role: "General Practice",
  initials: "SJ",
  color: "#0EA5E9",
};

const initialMessages: ChatMessage[] = [
  { id: 1, sender: "doctor", text: "Hello! I can see you clearly. How are you feeling today?", time: "10:01 AM" },
  { id: 2, sender: "patient", text: "Hi Doctor, I've been having headaches for the past week.", time: "10:02 AM" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function now(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function VideoConsultation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [micOn, setMicOn]           = useState<boolean>(true);
  const [camOn, setCamOn]           = useState<boolean>(true);
  const [elapsed, setElapsed]       = useState<number>(0);
  const [chatOpen, setChatOpen]     = useState<boolean>(false);
  const [rosterOpen, setRosterOpen] = useState<boolean>(false);
  const [messages, setMessages]     = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft]           = useState<string>("");
  const [showEndModal, setShowEndModal] = useState<boolean>(false);
  const [doctorJoined, setDoctorJoined] = useState<boolean>(false);

  // Simulate doctor joining after 3 seconds
  useEffect(() => {
    const t = setTimeout(() => setDoctorJoined(true), 3000);
    return () => clearTimeout(t);
  }, []);

  // Call timer
  useEffect(() => {
    if (!doctorJoined) return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [doctorJoined]);

  function sendMessage(): void {
    if (!draft.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "patient", text: draft.trim(), time: now() },
    ]);
    setDraft("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === "Enter") sendMessage();
  }

  function endCall(): void {
    navigate("/telemedicine");
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "#0B1120",
        display: "flex", flexDirection: "column",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .ctrl-btn {
          width: 52px; height: 52px; border-radius: 50%; border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background 0.15s, transform 0.1s;
          flex-shrink: 0;
        }
        .ctrl-btn:hover { transform: scale(1.08); }
        .ctrl-btn:active { transform: scale(0.96); }
        .ctrl-btn.on  { background: rgba(255,255,255,0.12); }
        .ctrl-btn.off { background: rgba(255,255,255,0.06); }
        .ctrl-btn.end { background: #EF4444; width: 60px; height: 60px; }
        .ctrl-btn.end:hover { background: #DC2626; }
        .ctrl-label {
          font-size: 10px; color: rgba(255,255,255,0.45);
          margin-top: 5px; text-align: center;
        }
        .chat-input {
          flex: 1; background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 10px; padding: 9px 14px;
          color: #fff; font-size: 13px;
          font-family: 'DM Sans', sans-serif; outline: none;
        }
        .chat-input::placeholder { color: rgba(255,255,255,0.3); }
        .chat-input:focus { border-color: rgba(14,165,233,0.5); }
        .send-btn {
          width: 36px; height: 36px; border-radius: 10px;
          background: #0EA5E9; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: background 0.15s;
        }
        .send-btn:hover { background: #0284C7; }
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.7);
          display: flex; align-items: center; justify-content: center;
          z-index: 100;
        }
        .modal {
          background: #1E293B; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px; padding: 2rem; width: 320px; text-align: center;
        }
      `}</style>

      {/* ── Top bar ── */}
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px",
          background: "rgba(255,255,255,0.04)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: doctor.color + "33",
              border: `1.5px solid ${doctor.color}55`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 600, color: doctor.color,
            }}
          >
            {doctor.initials}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{doctor.name}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{doctor.role}</div>
          </div>
          {doctorJoined && (
            <span
              style={{
                fontSize: 11, fontWeight: 600,
                background: "rgba(16,185,129,0.15)",
                color: "#34D399", padding: "3px 10px",
                borderRadius: 999, marginLeft: 4,
              }}
            >
              ● Live
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              fontFamily: "monospace", fontSize: 15, fontWeight: 600,
              color: doctorJoined ? "#34D399" : "rgba(255,255,255,0.3)",
              background: "rgba(255,255,255,0.06)",
              padding: "5px 14px", borderRadius: 8,
            }}
          >
            {formatTime(elapsed)}
          </div>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
            ID: #{id}
          </span>
        </div>
      </div>

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

        {/* Doctor video (main) */}
        <div
          style={{
            flex: 1, background: "#111827",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative",
          }}
        >
          {doctorJoined ? (
            <div
              style={{
                width: "100%", height: "100%",
                background: "linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 100, height: 100, borderRadius: "50%",
                  background: doctor.color + "22",
                  border: `3px solid ${doctor.color}55`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 32, fontWeight: 600, color: doctor.color,
                }}
              >
                {doctor.initials}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 72, height: 72, borderRadius: "50%",
                  background: "rgba(255,255,255,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <Video size={28} color="rgba(255,255,255,0.3)" />
              </div>
              <p style={{ color: "#fff", fontSize: 16, fontWeight: 500 }}>
                Waiting for doctor to join…
              </p>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginTop: 8 }}>
                Your session will begin shortly
              </p>
              <div
                style={{
                  display: "flex", gap: 6, justifyContent: "center", marginTop: 16,
                }}
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: "rgba(14,165,233,0.6)",
                      animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
              <style>{`
                @keyframes pulse {
                  0%, 100% { opacity: 0.3; transform: scale(0.8); }
                  50% { opacity: 1; transform: scale(1.1); }
                }
              `}</style>
            </div>
          )}

          {/* Self preview (PiP) */}
          <div
            style={{
              position: "absolute", bottom: 16, right: 16,
              width: 180, height: 130,
              background: camOn ? "#1E293B" : "#0F172A",
              borderRadius: 12,
              border: "2px solid rgba(255,255,255,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {camOn ? (
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: "#0EA5E933",
                    border: "1.5px solid #0EA5E955",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 6px",
                    fontSize: 14, fontWeight: 600, color: "#0EA5E9",
                  }}
                >
                  You
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Camera on</div>
              </div>
            ) : (
              <div style={{ textAlign: "center" }}>
                <VideoOff size={24} color="rgba(255,255,255,0.25)" style={{ margin: "0 auto 6px", display: "block" }} />
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Camera off</div>
              </div>
            )}
            <div
              style={{
                position: "absolute", top: 6, left: 8,
                fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 500,
              }}
            >
              You
            </div>
          </div>

          {/* Mic muted badge */}
          {!micOn && (
            <div
              style={{
                position: "absolute", bottom: 100, left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(239,68,68,0.9)",
                color: "#fff", fontSize: 12, fontWeight: 600,
                padding: "5px 14px", borderRadius: 999,
                display: "flex", alignItems: "center", gap: 5,
              }}
            >
              <MicOff size={13} /> Microphone muted
            </div>
          )}
        </div>

        {/* ── Chat panel ── */}
        {chatOpen && (
          <div
            style={{
              width: 300, background: "#0F172A",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
              display: "flex", flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "14px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Chat</span>
              <button
                onClick={() => setChatOpen(false)}
                style={{
                  background: "transparent", border: "none",
                  cursor: "pointer", color: "rgba(255,255,255,0.4)",
                  padding: 4,
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div
              style={{
                flex: 1, overflowY: "auto", padding: "12px 14px",
                display: "flex", flexDirection: "column", gap: 10,
              }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: msg.sender === "patient" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "80%",
                      background: msg.sender === "patient"
                        ? "#0EA5E9"
                        : "rgba(255,255,255,0.09)",
                      color: "#fff",
                      padding: "8px 12px",
                      borderRadius: msg.sender === "patient"
                        ? "12px 12px 2px 12px"
                        : "12px 12px 12px 2px",
                      fontSize: 13, lineHeight: 1.5,
                    }}
                  >
                    {msg.text}
                  </div>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 3 }}>
                    {msg.time}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                padding: "12px 14px",
                borderTop: "1px solid rgba(255,255,255,0.08)",
                display: "flex", gap: 8, alignItems: "center",
              }}
            >
              <input
                className="chat-input"
                type="text"
                placeholder="Type a message…"
                value={draft}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button className="send-btn" onClick={sendMessage}>
                <Send size={14} color="#fff" />
              </button>
            </div>
          </div>
        )}

        {/* ── Roster panel ── */}
        {rosterOpen && (
          <div
            style={{
              width: 240, background: "#0F172A",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
              display: "flex", flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "14px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Participants</span>
              <button
                onClick={() => setRosterOpen(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: 4 }}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { name: "Dr. Sarah Johnson", role: "Host · Doctor", initials: "SJ", color: "#0EA5E9", online: doctorJoined },
                { name: "You (Patient)", role: "Patient", initials: "P", color: "#8B5CF6", online: true },
              ].map((p) => (
                <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: p.color + "22", border: `1.5px solid ${p.color}44`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 600, color: p.color,
                    }}
                  >
                    {p.initials}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#fff" }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{p.role}</div>
                  </div>
                  <div
                    style={{
                      marginLeft: "auto", width: 8, height: 8, borderRadius: "50%",
                      background: p.online ? "#10B981" : "#475569",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Controls bar ── */}
      <div
        style={{
          background: "#0F172A",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          padding: "16px 24px",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
        }}
      >
        {/* Mic */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <button className={`ctrl-btn ${micOn ? "on" : "off"}`} onClick={() => setMicOn((v) => !v)}>
            {micOn
              ? <Mic size={20} color="#fff" />
              : <MicOff size={20} color="#EF4444" />}
          </button>
          <span className="ctrl-label">{micOn ? "Mute" : "Unmute"}</span>
        </div>

        {/* Camera */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <button className={`ctrl-btn ${camOn ? "on" : "off"}`} onClick={() => setCamOn((v) => !v)}>
            {camOn
              ? <Video size={20} color="#fff" />
              : <VideoOff size={20} color="#EF4444" />}
          </button>
          <span className="ctrl-label">{camOn ? "Stop video" : "Start video"}</span>
        </div>

        {/* End call */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <button className="ctrl-btn end" onClick={() => setShowEndModal(true)}>
            <PhoneOff size={22} color="#fff" />
          </button>
          <span className="ctrl-label">End call</span>
        </div>

        {/* Chat */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <button
            className={`ctrl-btn ${chatOpen ? "on" : "off"}`}
            onClick={() => { setChatOpen((v) => !v); setRosterOpen(false); }}
            style={{ position: "relative" }}
          >
            <MessageSquare size={20} color={chatOpen ? "#0EA5E9" : "#fff"} />
            {messages.length > 0 && !chatOpen && (
              <span
                style={{
                  position: "absolute", top: 6, right: 6,
                  width: 8, height: 8, borderRadius: "50%",
                  background: "#0EA5E9",
                }}
              />
            )}
          </button>
          <span className="ctrl-label">Chat</span>
        </div>

        {/* Participants */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <button
            className={`ctrl-btn ${rosterOpen ? "on" : "off"}`}
            onClick={() => { setRosterOpen((v) => !v); setChatOpen(false); }}
          >
            <Users size={20} color={rosterOpen ? "#0EA5E9" : "#fff"} />
          </button>
          <span className="ctrl-label">Participants</span>
        </div>
      </div>

      {/* ── End call modal ── */}
      {showEndModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div
              style={{
                width: 52, height: 52, borderRadius: "50%",
                background: "rgba(239,68,68,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <PhoneOff size={22} color="#EF4444" />
            </div>
            <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
              End consultation?
            </h3>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, marginBottom: 24, lineHeight: 1.5 }}>
              Are you sure you want to leave? The session will end for all participants.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowEndModal(false)}
                style={{
                  flex: 1, padding: "10px", borderRadius: 10,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}
              >
                Stay
              </button>
              <button
                onClick={endCall}
                style={{
                  flex: 1, padding: "10px", borderRadius: 10,
                  background: "#EF4444", border: "none",
                  color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}
              >
                End call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}