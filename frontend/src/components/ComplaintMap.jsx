import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet.heat";

/* ── Heat layer sub-component that lives INSIDE MapContainer ── */
function HeatLayer({ complaints }) {
    const map = useMap();
    const layerRef = useRef(null);

    useEffect(() => {
        // Remove previous heat layer
        if (layerRef.current) {
            map.removeLayer(layerRef.current);
            layerRef.current = null;
        }

        if (!complaints || complaints.length === 0) return;

        const heatPoints = complaints.map(c => [
            c.latitude,
            c.longitude,
            1
        ]);

        layerRef.current = L.heatLayer(heatPoints, {
            radius: 25,
            blur: 15,
            maxZoom: 17
        }).addTo(map);

        return () => {
            if (layerRef.current) {
                map.removeLayer(layerRef.current);
            }
        };
    }, [complaints, map]);

    return null;
}

/* ── Invalidate map size when container is rendered ── */
function MapResizer() {
    const map = useMap();
    useEffect(() => {
        // Small delay to let the container finish rendering
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 200);
        return () => clearTimeout(timer);
    }, [map]);
    return null;
}

function ComplaintMap({ complaints }) {
    return (
        <MapContainer
            center={[12.9716, 77.5946]}
            zoom={12}
            style={{ height: "100%", width: "100%", minHeight: "300px" }}
            scrollWheelZoom={true}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
            />

            <MapResizer />
            <HeatLayer complaints={complaints} />

            {complaints.map(c => (
                <Marker
                    key={c.complaint_id}
                    position={[c.latitude, c.longitude]}
                />
            ))}
        </MapContainer>
    );
}

export default ComplaintMap;