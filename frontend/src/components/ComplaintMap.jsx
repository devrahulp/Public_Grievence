import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

function ComplaintMap({ complaints }) {

  return (
    <div style={{ height: "400px", width: "100%" }}>

      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
      >

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {complaints.map((c) => (
          <Marker
            key={c.complaint_id}
            position={[c.latitude, c.longitude]}
          >
            <Popup>
              {c.description}
            </Popup>
          </Marker>
        ))}

      </MapContainer>

    </div>
  );
}

export default ComplaintMap;