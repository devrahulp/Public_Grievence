import React, { useEffect, useState } from "react";
import ComplaintMap from "./ComplaintMap";
import AnalyticsPanel from "./AnalyticsPanel";
import "./AdminDashboard.css";

function AdminDashboard() {

  const [complaints,setComplaints] = useState([]);
  const [analytics,setAnalytics] = useState(null);
  const [filter,setFilter] = useState("");

  useEffect(()=>{

    fetch("http://127.0.0.1:8000/complaints")
      .then(res=>res.json())
      .then(data=>setComplaints(data));

    fetch("http://127.0.0.1:8000/analytics")
      .then(res=>res.json())
      .then(data=>setAnalytics(data));

  },[]);

  const filtered = filter
  ? complaints.filter(c=>c.category===filter)
  : complaints;

  return(

<div className="dashboard">

{/* HEADER */}

<header className="dashboard-header">

<h1>🌆 Civic Intelligence Dashboard</h1>

<select onChange={e=>setFilter(e.target.value)}>

<option value="">All Categories</option>
<option value="tree">Tree Debris</option>
<option value="garbage">Garbage</option>
<option value="graffiti">Graffiti Removal</option>
<option value="pothole">Pot Holes</option>
<option value="abandoned_vehicle">Abandoned Vehicle</option>
<option value="abandoned_building">Abandoned Buildings</option>

</select>

</header>


{/* STATISTICS */}

{analytics && (

<div className="stats-grid">

<div className="stat-card">

<span>Total Complaints</span>
<h2>{analytics.total}</h2>

</div>

<div className="stat-card">

<span>Today's Issues</span>
<h2>{analytics.today}</h2>

</div>

<div className="stat-card">

<span>High Severity</span>
<h2>{analytics.high_severity}</h2>

</div>

</div>

)}


{/* ANALYTICS CHARTS */}

<AnalyticsPanel analytics={analytics}/>


{/* MAP */}

<div className="map-section">

<h2>Complaint Heatmap</h2>

<ComplaintMap complaints={filtered}/>

</div>


{/* TABLE */}

<div className="table-section">

<h2>Complaints</h2>

<table>

<thead>

<tr>
<th>ID</th>
<th>Category</th>
<th>Description</th>
<th>Location</th>
<th>Status</th>
</tr>

</thead>

<tbody>

{filtered.map(c=>(

<tr key={c.complaint_id}>

<td>{c.complaint_id}</td>
<td>{c.category}</td>
<td>{c.description}</td>
<td>{c.latitude},{c.longitude}</td>
<td>{c.status}</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

);

}

export default AdminDashboard;