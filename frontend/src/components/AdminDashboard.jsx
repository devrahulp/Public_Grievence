import React, { useEffect, useState } from "react";
import ComplaintMap from "./ComplaintMap";

function AdminDashboard() {

  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {

    fetch("http://127.0.0.1:8000/complaints")
      .then(res => res.json())
      .then(data => setComplaints(data));

  }, []);

  return (
    <div>

      <h2>Admin Dashboard</h2>

      <label>Filter by Category</label>

      <select onChange={(e) => setFilter(e.target.value)}>

        <option value="">All</option>
        <option>Abandoned Vehicle Complaint</option>
        <option>Alley Light Out</option>
        <option>Graffiti Removal</option>
        <option>Garbage Carts</option>
        <option>Pot Holes</option>
        <option>Rodent Baiting</option>
        <option>Sanitation Code Complaints</option>
        <option>Street Lights All Out</option>
        <option>Tree Debris</option>
        <option>Tree Trims</option>
        <option>Vacant and Abandoned Buildings</option>

      </select>

      <br /><br />

      <ComplaintMap complaints={complaints} />

      <br />

      <table border="1">

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

          {complaints
            .filter(c => filter === "" || c.category === filter)
            .map(c => (

              <tr key={c.complaint_id}>
                <td>{c.complaint_id}</td>
                <td>{c.category}</td>
                <td>{c.description}</td>
                <td>{c.latitude}, {c.longitude}</td>
                <td>{c.status}</td>
              </tr>

            ))}

        </tbody>

      </table>

    </div>
  );
}

export default AdminDashboard;