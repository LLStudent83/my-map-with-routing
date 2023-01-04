import { useMapEvent } from "react-leaflet";

export default function SetHandlersOnMap({ dispatch, state }) {
  useMapEvent("click", (e) => {
    dispatch({ type: "addPointInRoute", payload: e.latlng });
  });
  return null;
}
