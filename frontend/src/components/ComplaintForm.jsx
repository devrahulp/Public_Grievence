import { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "./ComplaintForm.css"


/* ── Constants ── */
const CATEGORIES = [
  {
    id: "tree", emoji: "🌳", label: "Tree Debris", days: "2–4", color: "#34d399",
    desc: "Fallen branches, uprooted trees, debris blocking roads or pathways."
  },
  {
    id: "garbage", emoji: "🗑️", label: "Garbage", days: "1–2", color: "#10b981",
    desc: "Uncollected waste, overflowing bins, illegal dumping of trash."
  },
  {
    id: "graffiti", emoji: "🖌️", label: "Graffiti Removal", days: "5–7", color: "#a78bfa",
    desc: "Vandalism, unauthorized graffiti on public walls or infrastructure."
  },
  {
    id: "pothole", emoji: "🕳️", label: "Pot Holes", days: "3–5", color: "#f59e0b",
    desc: "Road craters, potholes, damaged asphalt causing vehicle damage."
  },
  {
    id: "abandoned_vehicle", emoji: "🚗", label: "Abandoned Vehicle", days: "4–7", color: "#fb923c",
    desc: "Vehicles left without movement for extended periods on public roads."
  },
  {
    id: "abandoned_building", emoji: "🏚️", label: "Abandoned Buildings", days: "7–14", color: "#f87171",
    desc: "Derelict structures posing safety hazards to the public."
  },
  {
    id: "broken_streetlight", emoji: "💡", label: "Broken Streetlight", days: "3–5", color: "#fbbf24",
    desc: "Non-functional streetlights affecting visibility and safety."
  },
  {
    id: "water leakage", emoji: "💧", label: "Water Leakage", days: "2–4", color: "#3b82f6",
    desc: "Burst pipes, water seepage, leaks causing water wastage or damage."
  },
  {
    id: "flooded_road", emoji: "🌊", label: "Flooded Road", days: "5–10", color: "#60a5fa",
    desc: "Roads submerged due to heavy rains, poor drainage, causing traffic disruption."
  }
];

const SEVERITIES = [
  { id: "low", label: "Low", desc: "Minor inconvenience", color: "#34d399", bg: "rgba(52,211,153,.12)" },
  { id: "medium", label: "Medium", desc: "Affects daily routine", color: "#fbbf24", bg: "rgba(251,191,36,.12)" },
  { id: "high", label: "High", desc: "Safety concern", color: "#fb923c", bg: "rgba(251,146,60,.12)" },
  { id: "emergency", label: "Emergency", desc: "Immediate danger", color: "#f87171", bg: "rgba(248,113,113,.12)" },
];

// BBMP zone detection by lat/lng bounding boxes (simplified)
const ZONES = [
  { name: "Mahadevapura", bounds: { latMin: 12.95, latMax: 13.02, lngMin: 77.66, lngMax: 77.76 } },
  { name: "Bommanahalli", bounds: { latMin: 12.87, latMax: 12.93, lngMin: 77.60, lngMax: 77.68 } },
  { name: "Dasarahalli", bounds: { latMin: 13.03, latMax: 13.08, lngMin: 77.50, lngMax: 77.57 } },
  { name: "Byatarayanapura", bounds: { latMin: 13.05, latMax: 13.12, lngMin: 77.57, lngMax: 77.65 } },
  { name: "RR Nagar", bounds: { latMin: 12.91, latMax: 12.96, lngMin: 77.50, lngMax: 77.56 } },
  { name: "Yelahanka", bounds: { latMin: 13.08, latMax: 13.15, lngMin: 77.57, lngMax: 77.64 } },
  { name: "West Zone", bounds: { latMin: 12.94, latMax: 13.00, lngMin: 77.51, lngMax: 77.57 } },
];

function detectZone(lat, lng) {
  const z = ZONES.find(z => lat >= z.bounds.latMin && lat <= z.bounds.latMax && lng >= z.bounds.lngMin && lng <= z.bounds.lngMax);
  return z ? z.name : "Central";
}

// Simulated nearby complaints
function getNearbyComplaints(lat, lng) {
  return [
    { id: "CBR-1021", lat: lat + 0.002, lng: lng + 0.003, cat: "Pot Holes", severity: "high", status: "In Progress" },
    { id: "CBR-0987", lat: lat - 0.003, lng: lng + 0.001, cat: "Garbage", severity: "medium", status: "Submitted" },
    { id: "CBR-1105", lat: lat + 0.001, lng: lng - 0.004, cat: "Tree Debris", severity: "low", status: "Resolved" },
    { id: "CBR-0932", lat: lat - 0.002, lng: lng - 0.002, cat: "Abandoned Vehicle", severity: "high", status: "Acknowledged" },
  ];
}

function genComplaintId() {
  return "CBR-" + Math.floor(1000 + Math.random() * 9000);
}

// Simulated AI category suggestion
function suggestCategory(text) {
  const t = text.toLowerCase();
  if (t.includes("tree") || t.includes("branch") || t.includes("fallen") || t.includes("debris") || t.includes("leaves") || t.includes("trunk")) return "tree";
  if (t.includes("garbage") || t.includes("waste") || t.includes("trash") || t.includes("dump") || t.includes("bin") || t.includes("litter")) return "garbage";
  if (t.includes("graffiti") || t.includes("spray") || t.includes("paint") || t.includes("vandal") || t.includes("wall") || t.includes("tag")) return "graffiti";
  if (t.includes("pothole") || t.includes("pot hole") || t.includes("road") || t.includes("crater") || t.includes("pit") || t.includes("asphalt")) return "pothole";
  if (t.includes("abandon") && (t.includes("car") || t.includes("vehicle") || t.includes("bike") || t.includes("truck") || t.includes("auto"))) return "abandoned_vehicle";
  if (t.includes("abandon") && (t.includes("building") || t.includes("house") || t.includes("structure") || t.includes("property"))) return "abandoned_building";
  if (t.includes("vehicle") || t.includes("car") || t.includes("bike") || t.includes("parked")) return "abandoned_vehicle";
  if (t.includes("building") || t.includes("derelict") || t.includes("structure") || t.includes("ruin")) return "abandoned_building";
  return null;
}

/* ── Map recenter ── */
function MapRecenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lng], 15); }, [lat, lng, map]);
  return null;
}

/* ── Step indicator ── */
function StepBar({ current, total, labels }) {
  return (
    <div className="cf-stepbar">
      {labels.map((lbl, i) => (
        <div key={i} className={`cf-step-item ${i < current ? "cf-step-done" : i === current ? "cf-step-active" : ""}`}>
          <div className="cf-step-circle">
            {i < current ? "✓" : i + 1}
          </div>
          <span className="cf-step-label">{lbl}</span>
          {i < total - 1 && <div className="cf-step-line" />}
        </div>
      ))}
    </div>
  );
}

/* ── Photo preview card ── */
function PhotoCard({ file, onRemove }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  return (
    <div className="cf-photo-card">
      {url && <img src={url} alt={file.name} className="cf-photo-thumb" />}
      <div className="cf-photo-info">
        <span className="cf-photo-name">{file.name.length > 20 ? file.name.slice(0, 18) + "…" : file.name}</span>
        <span className="cf-photo-size">{(file.size / 1024).toFixed(0)} KB</span>
      </div>
      <button type="button" className="cf-photo-remove" onClick={onRemove}>✕</button>
    </div>
  );
}

/* ── Severity badge ── */
function SeverityPicker({ value, onChange }) {
  return (
    <div className="cf-sev-grid">
      {SEVERITIES.map(s => (
        <button
          key={s.id} type="button"
          className={`cf-sev-btn ${value === s.id ? "cf-sev-active" : ""}`}
          style={value === s.id ? { borderColor: s.color, background: s.bg, "--sc": s.color } : { "--sc": s.color }}
          onClick={() => onChange(s.id)}
        >
          <span className="cf-sev-dot" style={{ background: s.color }} />
          <div>
            <span className="cf-sev-name" style={value === s.id ? { color: s.color } : {}}>{s.label}</span>
            <span className="cf-sev-desc">{s.desc}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

/* ── Main component ── */
export default function ComplaintForm() {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState("");
  const [desc, setDesc] = useState("");
  const [photos, setPhotos] = useState([]);
  const [location, setLocation] = useState(null);
  const [zone, setZone] = useState("");
  const [locLoading, setLocLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [complaintId, setComplaintId] = useState("");
  const [nearbyComps, setNearbyComps] = useState([]);
  const aiTimer = useRef();

  const STEPS = ["Category", "Details", "Location", "Review"];

  // AI suggestion on description change
  useEffect(() => {
    if (desc.length < 10) { setAiSuggestion(null); return; }
    clearTimeout(aiTimer.current);
    setAiLoading(true);
    aiTimer.current = setTimeout(() => {
      const sug = suggestCategory(desc);
      setAiSuggestion(sug);
      setAiLoading(false);
    }, 700);
    return () => clearTimeout(aiTimer.current);
  }, [desc]);

  const captureLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setLocation({ lat: parseFloat(lat.toFixed(5)), lng: parseFloat(lng.toFixed(5)) });
      setZone(detectZone(lat, lng));
      setNearbyComps(getNearbyComplaints(lat, lng));
      setLocLoading(false);
    }, () => {
      // fallback to Bengaluru city center
      setLocation({ lat: 12.9716, lng: 77.5946 });
      setZone("Central");
      setNearbyComps(getNearbyComplaints(12.9716, 77.5946));
      setLocLoading(false);
    });
  }, []);

  const addPhotos = files => {
    const arr = Array.from(files).filter(f => f.type.startsWith("image/") || f.type === "application/pdf");
    setPhotos(prev => [...prev, ...arr].slice(0, 5));
  };

  const removePhoto = idx => setPhotos(prev => prev.filter((_, i) => i !== idx));
  const handleSubmit = async () => {
    try {

      console.log("🚀 Sending complaint...");

      const formData = new FormData();

      formData.append("category", category);
      formData.append("description", desc);
      formData.append("latitude", location.lat);
      formData.append("longitude", location.lng);

      if (photos.length > 0) {
        formData.append("image", photos[0]);
      }

      const res = await fetch("/submit-complaint", {
        method: "POST",
        body: formData
      });

      console.log("📡 Status:", res.status);

      if (!res.ok) {
        throw new Error("Server error");
      }

      const data = await res.json();

      console.log("✅ SUCCESS:", data);

      setComplaintId(data.complaint_id);
      setSubmitted(true);

    } catch (err) {
      console.error("❌ ERROR:", err);
      alert("Failed to submit complaint");
    }
  };



  const reset = () => {
    setStep(0); setCategory(""); setSeverity(""); setDesc("");
    setPhotos([]); setLocation(null); setZone(""); setAiSuggestion(null);
    setSubmitted(false); setComplaintId(""); setNearbyComps([]);
  };

  const catObj = CATEGORIES.find(c => c.id === category);
  const sevObj = SEVERITIES.find(s => s.id === severity);

  /* ── Nearby marker icon ── */
  const nearbyIcon = (status) => L.divIcon({
    className: "",
    html: `<div style="width:11px;height:11px;border-radius:50%;background:${status === "Resolved" ? "#34d399" : status === "In Progress" ? "#fbbf24" : "#f87171"
      };border:2px solid rgba(255,255,255,.8);box-shadow:0 2px 6px rgba(0,0,0,.4)"></div>`,
    iconSize: [11, 11], iconAnchor: [5, 5],
  });

  const userIcon = L.divIcon({
    className: "",
    html: `<div style="width:16px;height:16px;border-radius:50%;background:#6366f1;border:3px solid white;box-shadow:0 0 0 3px rgba(99,102,241,.4),0 2px 8px rgba(0,0,0,.5)"></div>`,
    iconSize: [16, 16], iconAnchor: [8, 8],
  });

  /* ── Success screen ── */
  if (submitted) return (
    <div className="cf-success">
      <div className="cf-success-badge">✅</div>
      <h3 className="cf-success-title">Complaint Filed!</h3>
      <div className="cf-success-id">
        <span className="cf-id-label">Your Complaint ID</span>
        <span className="cf-id-val">{complaintId}</span>
        <span className="cf-id-note">Save this ID to track your complaint status</span>
      </div>
      <div className="cf-success-timeline">
        {["Submitted", "Acknowledged", "In Progress", "Resolved"].map((s, i) => (
          <div key={s} className={`cf-tl-step ${i === 0 ? "cf-tl-active" : ""}`}>
            <div className="cf-tl-dot" />
            <span className="cf-tl-label">{s}</span>
          </div>
        ))}
      </div>
      {catObj && (
        <p className="cf-success-eta">
          ⏱️ Estimated resolution: <strong>{catObj.days} business days</strong>
        </p>
      )}
      <div className="cf-success-actions">
        <button className="cf-btn-gold" onClick={reset}>Submit Another</button>
        <button className="cf-btn-ghost" onClick={reset}>← Back to Home</button>
      </div>
    </div>
  );

  return (
    <div className="cf-wizard">

      {/* Step bar */}
      <StepBar current={step} total={STEPS.length} labels={STEPS} />

      {/* ── STEP 0: Category ── */}
      {step === 0 && (
        <div className="cf-panel">
          <div className="cf-panel-head">
            <h3 className="cf-panel-title">What's the issue?</h3>
            <p className="cf-panel-sub">Select the category that best describes your complaint</p>
          </div>

          {/* AI suggestion banner */}
          {aiSuggestion && desc.length > 10 && (
            <div className="cf-ai-banner">
              <span className="cf-ai-icon">🤖</span>
              <span>Based on your description, did you mean <strong>{CATEGORIES.find(c => c.id === aiSuggestion)?.label}</strong>?</span>
              <button type="button" className="cf-ai-apply" onClick={() => setCategory(aiSuggestion)}>Apply →</button>
            </div>
          )}

          <div className="cf-cat-grid">
            {CATEGORIES.map(c => (
              <button
                key={c.id} type="button"
                className={`cf-cat-btn ${category === c.id ? "cf-cat-active" : ""}`}
                style={{ "--cc": c.color }}
                onClick={() => setCategory(c.id)}
              >
                <span className="cf-cat-emoji">{c.emoji}</span>
                <span className="cf-cat-label">{c.label}</span>
                <span className="cf-cat-desc">{c.desc}</span>
                {category === c.id && <div className="cf-cat-check">✓</div>}
              </button>
            ))}
          </div>

          {catObj && (
            <div className="cf-eta-chip" style={{ "--cc": catObj.color }}>
              ⏱️ Typical resolution: <strong>{catObj.days} business days</strong>
            </div>
          )}

          <div className="cf-nav">
            <span />
            <button className="cf-btn-gold" disabled={!category} onClick={() => setStep(1)}>
              Next → Details
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 1: Details ── */}
      {step === 1 && (
        <div className="cf-panel">
          <div className="cf-panel-head">
            <h3 className="cf-panel-title">Describe the issue</h3>
            <p className="cf-panel-sub">Help BBMP understand the problem clearly</p>
          </div>

          {/* Description with live AI suggestion */}
          <div className="cf-field">
            <label className="cf-label">
              Description <span className="cf-req">*</span>
              {aiLoading && <span className="cf-ai-thinking">🤖 analysing…</span>}
              {aiSuggestion && !aiLoading && category !== aiSuggestion && (
                <button type="button" className="cf-ai-inline" onClick={() => { setCategory(aiSuggestion); }}>
                  🤖 Switch to "{CATEGORIES.find(c => c.id === aiSuggestion)?.label}"?
                </button>
              )}
            </label>
            <textarea
              className="cf-textarea"
              placeholder="e.g. Large pothole near HDFC ATM on 80ft road, Indiranagar — about 1ft deep, causing accidents…"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={5}
            />
            <span className="cf-char-count">{desc.length} / 500</span>
          </div>

          {/* Severity */}
          <div className="cf-field">
            <label className="cf-label">Severity <span className="cf-req">*</span></label>
            <SeverityPicker value={severity} onChange={setSeverity} />
          </div>

          {/* Photos */}
          <div className="cf-field">
            <label className="cf-label">
              Photos / Evidence
              <span className="cf-opt"> — up to 5 images</span>
            </label>
            <div
              className={`cf-dropzone ${dragOver ? "cf-dz-over" : ""}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); addPhotos(e.dataTransfer.files); }}
              onClick={() => document.getElementById("cf-photo-input").click()}
            >
              <input id="cf-photo-input" type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => addPhotos(e.target.files)} />
              <span className="cf-dz-icon">📤</span>
              <span className="cf-dz-text">Drag & drop or <span className="cf-dz-link">browse</span></span>
              <span className="cf-dz-hint">JPG, PNG — up to 5 photos, 10 MB each</span>
            </div>

            {photos.length > 0 && (
              <div className="cf-photo-grid">
                {photos.map((f, i) => (
                  <PhotoCard key={i} file={f} onRemove={() => removePhoto(i)} />
                ))}
              </div>
            )}
          </div>

          <div className="cf-nav">
            <button className="cf-btn-ghost" onClick={() => setStep(0)}>← Back</button>
            <button className="cf-btn-gold" disabled={!desc.trim() || !severity} onClick={() => setStep(2)}>
              Next → Location
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Location ── */}
      {step === 2 && (
        <div className="cf-panel">
          <div className="cf-panel-head">
            <h3 className="cf-panel-title">Pin the location</h3>
            <p className="cf-panel-sub">We'll detect your BBMP zone automatically</p>
          </div>

          <div className="cf-loc-row">
            <button
              type="button"
              className={`cf-loc-btn ${location ? "cf-loc-done" : ""}`}
              onClick={captureLocation}
              disabled={locLoading}
            >
              {locLoading
                ? <><span className="cf-spinner" /> Detecting location…</>
                : location
                  ? <>📍 {location.lat}, {location.lng}</>
                  : <>📍 Capture My Location</>
              }
            </button>
            {zone && (
              <div className="cf-zone-badge">
                🗺️ <strong>{zone} Zone</strong>
              </div>
            )}
          </div>

          {location && (
            <>
              {/* Map */}
              <div className="cf-map-wrap">
                <MapContainer center={[location.lat, location.lng]} zoom={15} className="cf-leaflet" scrollWheelZoom={false}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="&copy; OSM &copy; CARTO" />
                  <MapRecenter lat={location.lat} lng={location.lng} />
                  <Marker position={[location.lat, location.lng]} icon={userIcon}>
                    <Popup><strong>Your location</strong></Popup>
                  </Marker>
                  <Circle center={[location.lat, location.lng]} radius={300} pathOptions={{ color: "#6366f1", fillColor: "#6366f1", fillOpacity: .08, weight: 1 }} />
                  {nearbyComps.map(c => (
                    <Marker key={c.id} position={[c.lat, c.lng]} icon={nearbyIcon(c.status)}>
                      <Popup>
                        <strong>{c.id}</strong><br />
                        {c.cat}<br />
                        <span style={{ fontSize: 11, color: "#888" }}>{c.status}</span>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>

              {/* Nearby complaints */}
              {nearbyComps.length > 0 && (
                <div className="cf-nearby">
                  <p className="cf-nearby-title">📌 Nearby complaints in your area</p>
                  <div className="cf-nearby-list">
                    {nearbyComps.map(c => (
                      <div key={c.id} className="cf-nearby-item">
                        <div className="cf-nearby-id">{c.id}</div>
                        <div className="cf-nearby-cat">{c.cat}</div>
                        <div className={`cf-nearby-status cf-ns-${c.status.toLowerCase().replace(" ", "-")}`}>{c.status}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="cf-nav">
            <button className="cf-btn-ghost" onClick={() => setStep(1)}>← Back</button>
            <button className="cf-btn-gold" disabled={!location} onClick={() => setStep(3)}>
              Next → Review
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Review ── */}
      {step === 3 && (
        <div className="cf-panel">
          <div className="cf-panel-head">
            <h3 className="cf-panel-title">Review & Submit</h3>
            <p className="cf-panel-sub">Check everything before filing your complaint</p>
          </div>

          <div className="cf-review-grid">
            <div className="cf-review-card">
              <span className="cf-review-label">Category</span>
              <span className="cf-review-val">{catObj?.emoji} {catObj?.label}</span>
            </div>
            <div className="cf-review-card">
              <span className="cf-review-label">Severity</span>
              <span className="cf-review-val" style={{ color: sevObj?.color }}>
                <span className="cf-sev-dot" style={{ background: sevObj?.color }} />
                {sevObj?.label}
              </span>
            </div>
            <div className="cf-review-card">
              <span className="cf-review-label">Zone</span>
              <span className="cf-review-val">🗺️ {zone}</span>
            </div>
            <div className="cf-review-card">
              <span className="cf-review-label">Location</span>
              <span className="cf-review-val" style={{ fontSize: 13 }}>📍 {location?.lat}, {location?.lng}</span>
            </div>
            <div className="cf-review-card cf-review-full">
              <span className="cf-review-label">Description</span>
              <span className="cf-review-val cf-review-desc">{desc}</span>
            </div>
            {photos.length > 0 && (
              <div className="cf-review-card cf-review-full">
                <span className="cf-review-label">Photos ({photos.length})</span>
                <div className="cf-review-photos">
                  {photos.map((f, i) => {
                    const url = URL.createObjectURL(f);
                    return <img key={i} src={url} alt="" className="cf-review-photo" />;
                  })}
                </div>
              </div>
            )}
            <div className="cf-review-card cf-review-eta" style={{ "--cc": catObj?.color }}>
              <span className="cf-review-label">Estimated Resolution</span>
              <span className="cf-review-val">⏱️ {catObj?.days} business days</span>
            </div>
          </div>

          <div className="cf-privacy-note">
            🔒 Your report is encrypted and shared only with BBMP officials.
          </div>

          <div className="cf-nav">
            <button className="cf-btn-ghost" onClick={() => setStep(2)}>← Back</button>
            <button className="cf-btn-gold cf-btn-submit" onClick={handleSubmit}>
              🚀 Submit Complaint
            </button>
          </div>
        </div>
      )}
    </div>
  );
}