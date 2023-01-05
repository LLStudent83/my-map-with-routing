import React from "react";
import { ReactComponent as SwapIcon } from "../static/icon/swap.svg";
import styles from "./mapWithRouting.module.css";

export default function SwapPoint({ dispatch, state }) {
  const { wayPoints } = state;

  const hendleSwapPoint = () => {
    if (wayPoints.length < 2) {
      return;
    }
    const arrRevers = [wayPoints[1], wayPoints[0]];
    dispatch({ type: "swapPoints", payload: arrRevers });
  };

  return (
    <SwapIcon className={styles.swapPointIcon} onClick={hendleSwapPoint} />
  );
}
