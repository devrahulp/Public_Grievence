import React, { useEffect, useState } from "react";
import ComplaintMap from "./ComplaintMap";
import AnalyticsPanel from "./AnalyticsPanel";
import "./AdminDashboard.css";

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "tree", label: "Tree Debris" },
  { value: "garbage", label: "Garbage" },
  { value: "graffiti", label: "Graffiti Removal" },
  { value: "pothole", label: "Pot Holes" },
  { value: "abandoned_vehicle", label: "Abandoned Vehicle" },
  { value: "abandoned_building", label: "Abandoned Buildings" },
  { value: "broken_streetlight", label: "Broken Streetlight" },
  { value: "water leakage", label: "Water Leakage" },
  { value: "flooded_road", label: "Flooded Road" },
];

const STATUS_FILTERS = ["All", "Pending", "Approved", "In Progress", "Cleared"];

const SEVERITY_COLORS = { high: "#f87171", medium: "#f59e0b", low: "#22d3a5" };

function AdminDashboard() {

  const [complaints, setComplaints] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      fetch("http://127.0.0.1:8000/complaints")
        .then(res => res.json()),
      fetch("http://127.0.0.1:8000/analytics")
        .then(res => res.json()),
    ])
      .then(([complaintsData, analyticsData]) => {
        setComplaints(complaintsData);
        setAnalytics(analyticsData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch data:", err);
        setError("Unable to connect to backend. Please ensure the server is running on port 8000.");
        setLoading(false);
      });
  }, []);

  // Apply category filter
  let filtered = filter
    ? complaints.filter(c => c.category === filter)
    : complaints;

  // Apply status filter
  if (statusFilter !== "All") {
    filtered = filtered.filter(c =>
      c.status && c.status.toLowerCase() === statusFilter.toLowerCase()
    );
  }

  // Counts for status filter badges
  const statusCounts = {
    All: complaints.length,
    Pending: complaints.filter(c => c.status === "Pending").length,
    Approved: complaints.filter(c => c.status === "Approved").length,
    "In Progress": complaints.filter(c => c.status === "In Progress").length,
    Cleared: complaints.filter(c => c.status === "Cleared").length,
  };

  const severityPill = (sev) => {
    const cls = sev === "high" ? "p-high" : sev === "medium" ? "p-med" : "p-low";
    return <span className={`priority-dot ${cls}`}></span>;
  };

  const statusPill = (status) => {
    const key = (status || "pending").toLowerCase().replace(/\s+/g, "");
    const map = {
      pending: "pill-pending",
      approved: "pill-approved",
      inprogress: "pill-progress",
      cleared: "pill-cleared",
    };
    return <span className={`status-pill ${map[key] || "pill-pending"}`}>{status || "Pending"}</span>;
  };

  return (
    <div className="dash">

      {/* ── HEADER ── */}
      <header className="header">
        <div className="header-left">
          <div className="logo-mark">CV</div>
          <div className="header-text">
            <h1>Civic Intelligence Dashboard</h1>
            <p>Real-time complaint monitoring &amp; analytics</p>
          </div>
        </div>

        <div className="header-right">
          <span className="badge-live">LIVE</span>
          <select
            className="select-styled"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </header>

      {/* ── LOADING / ERROR ── */}
      {loading && (
        <div className="empty-state">
          <p>⏳ Loading dashboard data...</p>
        </div>
      )}

      {error && (
        <div className="empty-state" style={{ color: "#f87171" }}>
          <p>⚠️ {error}</p>
          <p style={{ fontSize: "12px", marginTop: "8px", color: "#8b9cc7" }}>
            Make sure the backend is running: <code>uvicorn main:app --reload</code>
          </p>
        </div>
      )}

      {/* ── STATUS FILTER BAR ── */}
      {!loading && !error && (
        <div className="filter-bar">
          <span className="filter-label">Status</span>
          {STATUS_FILTERS.map(s => {
            const activeClass = statusFilter === s
              ? `active-${s.toLowerCase().replace(/\s+/g, "")}`
              : "";
            return (
              <button
                key={s}
                className={`filter-btn ${activeClass}`}
                onClick={() => setStatusFilter(s)}
              >
                {s}
                <span className="filter-count">{statusCounts[s] || 0}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── STAT CARDS ── */}
      {analytics && (
        <div className="stats-row">
          <div className="stat-card" style={{ "--accent-color": "#4f8fff" }}>
            <div className="stat-icon" style={{ background: "rgba(79,143,255,0.15)" }}>📋</div>
            <div className="stat-label">Total Complaints</div>
            <div className="stat-value">{analytics.total}</div>
          </div>

          <div className="stat-card" style={{ "--accent-color": "#38e9b4" }}>
            <div className="stat-icon" style={{ background: "rgba(56,233,180,0.15)" }}>📅</div>
            <div className="stat-label">Today's Issues</div>
            <div className="stat-value">{analytics.today}</div>
          </div>

          <div className="stat-card" style={{ "--accent-color": "#f87171" }}>
            <div className="stat-icon" style={{ background: "rgba(248,113,113,0.15)" }}>🔴</div>
            <div className="stat-label">High Severity</div>
            <div className="stat-value">{analytics.high_severity}</div>
          </div>

          <div className="stat-card" style={{ "--accent-color": "#a78bfa" }}>
            <div className="stat-icon" style={{ background: "rgba(167,139,250,0.15)" }}>📍</div>
            <div className="stat-label">Hotspots</div>
            <div className="stat-value">{analytics.hotspots ? analytics.hotspots.length : 0}</div>
          </div>
        </div>
      )}

      {/* ── ANALYTICS CHARTS ── */}
      {analytics && (
        <div className="analytics-row">
          <AnalyticsPanel analytics={analytics} />
        </div>
      )}

      {/* ── MAP ── */}
      {!loading && !error && (
        <div className="map-card">
          <div className="map-header">
            <div>
              <span className="card-title">Complaint Heatmap</span>
              <span className="card-subtitle" style={{ marginLeft: "12px" }}>
                {filtered.length} complaints mapped
              </span>
            </div>
            <span className="card-tag">Bengaluru</span>
          </div>
          <div className="map-body">
            <ComplaintMap complaints={filtered} />
          </div>
        </div>
      )}

      {/* ── TABLE ── */}
      {!loading && !error && (
        <div className="table-card">
          <div className="table-header-row">
            <span className="card-title">Recent Complaints</span>
            <span className="card-tag">{filtered.length} records</span>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">No complaints found for the selected filters.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category</th>
                  <th>Severity</th>
                  <th>Photo</th>
                  <th>Description</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Deadline</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.complaint_id}>
                    <td style={{ fontFamily: "var(--mono)", fontSize: "12px" }}>{c.complaint_id}</td>
                    <td>{c.category}</td>
                    <td>{severityPill(c.severity)} {c.severity}</td>
                    <td>
                      {c.image ? (
                        <a href={`http://127.0.0.1:8000/${c.image}`} target="_blank" rel="noreferrer">
                          <div style={{
                            width: "36px", height: "36px", borderRadius: "6px",
                            backgroundImage: `url(http://127.0.0.1:8000/${c.image})`,
                            backgroundSize: "cover", backgroundPosition: "center",
                            border: "1px solid var(--border)"
                          }} title="View Image" />
                        </a>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>No photo</span>
                      )}
                    </td>
                    <td style={{ maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.description}
                    </td>
                    <td style={{ fontFamily: "var(--mono)", fontSize: "11px" }}>
                      {c.latitude?.toFixed(4)}, {c.longitude?.toFixed(4)}
                    </td>
                    <td>{statusPill(c.status)}</td>
                    <td>{c.created_at}<br /><span style={{ fontSize: "11px", color: "#4f5f87" }}>{c.created_time}</span></td>
                    <td>{c.deadline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;