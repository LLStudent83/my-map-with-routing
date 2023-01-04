import React, { useState } from "react";
import { useMapEvent, Marker, Popup } from "react-leaflet";

export default function RouteMarker({ position, textPopup }) {
  //   let text = "";
  //   const [position, setPosition] = useState(null);
  //   const map = useMapEvent("click", (e) => {
  //     setPosition(e.latlng);
  //   });

  return (
    <Marker position={position} draggable={false}>
      <Popup>{textPopup}</Popup>
    </Marker>
  );
}
