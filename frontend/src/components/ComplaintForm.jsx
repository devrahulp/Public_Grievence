import { useState } from "react";

function ComplaintForm() {

  const [description,setDescription] = useState("");
  const [image,setImage] = useState(null);
  const [location,setLocation] = useState(null);
  const [complaintId,setComplaintId] = useState("");
  const [category,setCategory] = useState("");

  const getLocation = () => {

    navigator.geolocation.getCurrentPosition((pos)=>{

      setLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      });

    });

  };

  const submitComplaint = async (e) => {

    e.preventDefault();

    if(!location){
      alert("Please capture location first");
      return;
    }

    const formData = new FormData();

    formData.append("description",description);
    formData.append("latitude",location.lat);
    formData.append("longitude",location.lng);
    formData.append("image",image);

    const res = await fetch("http://127.0.0.1:8000/submit-complaint",{
      method:"POST",
      body:formData
    });

    const data = await res.json();

    setComplaintId(data.complaint_id);
  };

  return (

    <div className="card">

      <h2>Report an Issue</h2>

      <form onSubmit={submitComplaint}>
        <label>Issue Category</label>

<select
onChange={(e)=>setCategory(e.target.value)}
>

<option value="">Select Issue</option>

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
        <textarea
        placeholder="Describe the issue"
        onChange={(e)=>setDescription(e.target.value)}
        />

        <br/><br/>

        <input
        type="file"
        onChange={(e)=>setImage(e.target.files[0])}
        />

        <br/><br/>

        <button type="button" onClick={getLocation}>
          Capture Location
        </button>

        {location && (
          <p>
            Lat: {location.lat} <br/>
            Lng: {location.lng}
          </p>
        )}

        <button className="submit" type="submit">
          Submit Complaint
          formData.append("category",category);
        </button>

      </form>

      {complaintId && (
        <h3>Complaint ID: {complaintId}</h3>
      )}

    </div>

  );
}

export default ComplaintForm;