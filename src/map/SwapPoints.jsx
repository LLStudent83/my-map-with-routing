import React from "react";
import { ReactComponent as SwapIcon } from "../static/icon/swap.svg";
import styles from "./mapWithRouting.module.css";

export default function SwapPoint({ dispatch, state }) {
  const { waypoints } = state;

  const hendleSwapPoint = () => {
    if (waypoints.length < 2) {
      return;
    }
    const arrRevers = [waypoints[1], waypoints[0]];
    dispatch({ type: "swapPoints", payload: arrRevers });
  };

  return (
    <SwapIcon className={styles.swapPointIcon} onClick={hendleSwapPoint} />
  );
}
