import React from "react";
import { Marker, Popup } from "react-leaflet";

export default function RouteMarker({ position, textPopup }) {
  return (
    <Marker position={position} draggable={false}>
      <Popup>{textPopup}</Popup>
    </Marker>
  );
}
