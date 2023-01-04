import React from "react";
import { ReactComponent as CarIcon } from "../static/icon/car-route.svg";
import { ReactComponent as WalkIcon } from "../static/icon/foot-route.svg";
import styles from "./mapWithRouting.module.css";

export default function ChangeVehicle({ dispatch, state }) {
  const { vehicle } = state;

  const handlerClick = (e) => {
    if (e.target.classList.contains("active")) {
      return;
    }
    const newWehicle = vehicle === "car" ? "walk" : "car";
    dispatch({ type: "setVehicle", payload: newWehicle });
  };

  let carVehicleClasses = `changeVehicleButton ${
    vehicle === "car" && "active"
  }`;
  let walkVehicleClasses = `changeVehicleButton ${
    vehicle === "walk" && "active"
  }`;

  return (
    <div className={styles.changeVehicleContainer}>
      <CarIcon className={carVehicleClasses} onClick={(e) => handlerClick(e)} />
      <WalkIcon
        className={walkVehicleClasses}
        onClick={(e) => handlerClick(e)}
      />
    </div>
  );
}
