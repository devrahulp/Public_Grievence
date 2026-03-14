import { useState } from "react";

function TrackComplaint() {

    const [id, setId] = useState("");
    const [data, setData] = useState(null);

    const track = async () => {

        const res = await fetch(`/track/${id}`);
        const result = await res.json();

        setData(result);

    };

    return (

        <div style={{ padding: "40px" }}>

            <h2>Track Your Complaint</h2>

            <input
                placeholder="Enter Complaint ID"
                value={id}
                onChange={e => setId(e.target.value)}
            />

            <button onClick={track}>Track</button>

            {data && (

                <div style={{ marginTop: "20px" }}>

                    <p><b>ID:</b> {data.complaint_id}</p>
                    <p><b>Category:</b> {data.category}</p>
                    <p><b>Status:</b> {data.status}</p>
                    <p><b>Raised On:</b> {data.created_at}</p>
                    <p><b>Deadline:</b> {data.deadline}</p>
                    <p><b>Days Left:</b> {data.days_left}</p>
                    <p><b>Description:</b> {data.description}</p>

                </div>

            )}

        </div>

    );

}

export default TrackComplaint;