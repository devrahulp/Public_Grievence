import { MapContainer, TileLayer, Marker } from "react-leaflet"
import { useEffect } from "react"
import L from "leaflet"
import "leaflet.heat"

function ComplaintMap({ complaints }) {

useEffect(()=>{

const map = window.leafletMap

if(!map) return

const heatPoints = complaints.map(c => [
c.latitude,
c.longitude,
1
])

L.heatLayer(heatPoints,{
radius:25,
blur:15,
maxZoom:17
}).addTo(map)

},[complaints])


return(

<MapContainer
center={[12.9716,77.5946]}
zoom={12}
style={{height:"400px"}}
whenCreated={(map)=>window.leafletMap=map}
>

<TileLayer
url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
/>

{complaints.map(c=>(

<Marker
key={c.complaint_id}
position={[c.latitude,c.longitude]}
/>

))}

</MapContainer>

)

}

export default ComplaintMap