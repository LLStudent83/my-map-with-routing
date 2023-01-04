import React, { useReducer } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import styles from "./mapWithRouting.module.css";
import ChangeVehicle from "./ChangeVehicle";
import SwapPoints from "./SwapPoints";
import RoutingMashine from "./RoutingMashine";
import "./leafletStyles.css";

const initialState = {
  vehicle: "car",
  waypoints: [],
};

function mapReducer(state, action) {
  switch (action.type) {
    case "setVehicle":
      return { ...state, vehicle: action.payload };
    case "swapPoints":
      return { ...state, waypoints: action.payload };
    case "addPointInRoute":
      return { ...state, waypoints: action.payload };
    default:
      throw new Error();
  }
}

function MapWithRouting() {
  const [state, dispatch] = useReducer(mapReducer, initialState);

  return (
    <MapContainer zoom={10} center={[56.8519, 60.6122]}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <ChangeVehicle dispatch={dispatch} state={state} />
      <SwapPoints dispatch={dispatch} state={state} />
    </MapContainer>
  );
}
export default MapWithRouting;
