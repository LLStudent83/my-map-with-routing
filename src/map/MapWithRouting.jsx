import React, { useReducer } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import styles from "./mapWithRouting.module.css";
import ChangeVehicle from "./ChangeVehicle";
import SwapPoints from "./SwapPoints";
import RoutingMashine from "./RoutingMashine";
import RouteMarker from "./RouteMarker";
import SetHandlersOnMap from "./SetHandlersOnMap";
import "./leafletStyles.css";

const initialState = {
  vehicle: "car",
  wayPoints: [],
};

function mapReducer(state, action) {
  switch (action.type) {
    case "setVehicle":
      return { ...state, vehicle: action.payload };
    case "swapPoints":
      return { ...state, wayPoints: action.payload };
    case "addPointInRoute": {
      if (state.wayPoints.length === 2) {
        return state;
      }
      const newWeypoints = [...state.wayPoints];
      newWeypoints.push(action.payload);
      return { ...state, wayPoints: newWeypoints };
    }

    default:
      throw new Error();
  }
}

function MapWithRouting() {
  const [state, dispatch] = useReducer(mapReducer, initialState);
  console.log(state.wayPoints);
  const routeMarkers = state.wayPoints.map((coord, n) => {
    return (
      <RouteMarker
        position={coord}
        textPopup={n === 0 ? "Начальная точка" : "Конечная точка"}
      />
    );
  });

  return (
    <MapContainer zoom={10} center={[56.8519, 60.6122]}>
      {routeMarkers}
      <SetHandlersOnMap dispatch={dispatch} state={state} />
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <ChangeVehicle dispatch={dispatch} state={state} />
      <SwapPoints dispatch={dispatch} state={state} />
      {state.wayPoints.length === 2 && (
        <RoutingMashine
          startPointCoord={state.wayPoints[0]}
          endPointCoord={state.wayPoints[1]}
          vehicle={state.vehicle}
        />
      )}
    </MapContainer>
  );
}
export default MapWithRouting;
