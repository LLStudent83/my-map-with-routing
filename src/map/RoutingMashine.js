/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useRef } from "react";
import L from "leaflet";
import { useLeafletContext } from "@react-leaflet/core";
import "leaflet-routing-machine";

const createRoutineMachineLayer = (props, context) => {
  const { startPointCoord, endPointCoord, vehicle } = props;

  const routingControl = L.Routing.control({
    waypoints: [L.latLng(startPointCoord), L.latLng(endPointCoord)],

    createMarker: (i, start, n) => {
      return null;
    },

    router: new L.Routing.OSRMv1({
      serviceUrl:
        vehicle === "walk"
          ? "https://routing.openstreetmap.de/routed-foot/route/v1"
          : "https://router.project-osrm.org/route/v1",
    }),

    lineOptions: {
      styles: [
        { color: "red", opacity: 1, weight: 8 },
        { color: "white", opacity: 0.3, weight: 6 },
      ],
      addWaypoints: false, // разрешает добавлять путевые точки к маршруту
    },
    routeWhileDragging: false, // маршрут будет меняться онлайн при перетаскивании точек
    language: "ru",
    addWaypoints: false, // false
    fitSelectedRoutes: false, // убирает автоцентрирование карты на маршруте
    routeDragInterval: 500,
    useZoomParameter: false, // пересчитывается или нет маршрут при увеличении карты
    showAlternatives: false, // показывает альтернативный маршрут или нет

    show: false, // показывает текстовую расшифровку маршрута;
    draggableWaypoints: true,
  });

  return routingControl;
};

function updateRoutineMachineLayer(instance, props, prevProps) {
  if (props.startPointCoord !== prevProps.startPointCoord) {
    instance.setWaypoints([
      L.latLng(props.startPointCoord),
      L.latLng(props.endPointCoord),
    ]);
  }
  if (props.vehicle !== prevProps.vehicle) {
    const router = instance.getRouter();
    router.options.serviceUrl =
      props.vehicle === "walk"
        ? "https://routing.openstreetmap.de/routed-foot/route/v1"
        : "https://router.project-osrm.org/route/v1";
    instance.route();
  }
}

// --------------------------- createElementHook ----------------------
export function createElementHook(createElement, updateElement) {
  if (updateElement == null) {
    return function useImmutableLeafletElement(props, context) {
      return useRef(createElement(props, context));
    };
  }
  return function useMutableLeafletElement(props, context) {
    const elementRef = useRef(createElement(props, context));
    const propsRef = useRef(props);
    const instance = elementRef.current;

    useEffect(() => {
      if (propsRef.current !== props) {
        updateElement(instance, props, propsRef.current);
        propsRef.current = props;
      }
    }, [instance, props, context]);

    return elementRef;
  };
}

function useLayerLifecycle(element, context) {
  useEffect(() => {
    const container = context.layerContainer ?? context.map;
    container.addControl(element);
    return () => {
      context.layerContainer
        ? context.layerContainer.removeLayer(element.instance)
        : context.map.removeControl(element);
    };
  }, [context, element]);
}

function createControlComponent(createInstance, updateInstance, props) {
  const context = useLeafletContext();
  const useElement = createElementHook(createInstance, updateInstance);
  const elementRef = useElement(props, context);
  useLayerLifecycle(elementRef.current, context);
}

export default function RoutingMachine(props) {
  createControlComponent(
    createRoutineMachineLayer,
    updateRoutineMachineLayer,
    props
  );
  return null;
}
