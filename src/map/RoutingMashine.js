/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useRef } from "react";
import L, { Icon } from "leaflet";
import { useLeafletContext } from "@react-leaflet/core";
import "leaflet-routing-machine";
import { useAppDispatch } from "../../../../hooks/redux";
import {
  setDistanceInRouteCreator,
  routeIsBuildingCreator,
} from "../../../../redux/Map/MapSearchReducer/actions/map";

const NewControl = L.Routing.Control.extend({
  _onZoomEnd() {
    if (!this._selectedRoute || !this._router.requiresMoreDetail) {
      return;
    }

    const map = this._map;
    if (
      this._router.requiresMoreDetail(
        this._selectedRoute,
        map.getZoom(),
        map.getBounds()
      )
    ) {
      this.route({
        callback: L.bind((err, routes) => {
          let i;
          if (!err) {
            for (i = 0; i < routes.length; i++) {
              this._routes[i].properties = routes[i].properties;
            }
            this._updateLineCallback(err, routes);
            // В родной метод была добавлена эта строчка во избежание вечного Loadera
            // возникает когда одна из путевых точек в процессе zoomе на MapSearch уходит за пределы карты

            this.fire("routesfound", {
              waypoints: routes[0].waypoints,
              routes,
            });
          }
        }, this),
        simplifyGeometry: false,
        geometryOnly: false,
      });
    }
  },
});

const createRoutineMachineLayer = (props, context) => {
  const {
    constructionCoord,
    projectCoord,
    dataIconsForMap,
    color,
    routeId,
    vehicle,
  } = props;
  const dispatch = useAppDispatch();

  const routingControl = new NewControl({
    waypoints: [L.latLng(constructionCoord), L.latLng(projectCoord)],

    createMarker: (i, start, n) => {
      if (!dataIconsForMap) {
        return null;
      }
      let marker_icon = null;
      if (i === 0) {
        // This is the first marker, indicating start
        marker_icon = dataIconsForMap[1];
      } else if (i === n - 1) {
        // This is the last marker indicating destination
        marker_icon = dataIconsForMap[0];
      }
      const marker = L.marker(start.latLng, {
        rotationAngle: marker_icon.rotationAngle,
        rotationOrigin: "center",
        draggable: true,
        bounceOnAdd: false,
        bounceOnAddOptions: {
          duration: 1000,
          height: 800,
        },
        icon: marker_icon.icon,
      });
      return marker;
    },

    router: new L.Routing.OSRMv1({
      serviceUrl:
        vehicle === "foot"
          ? "https://routing.openstreetmap.de/routed-foot/route/v1"
          : "https://router.project-osrm.org/route/v1",
    }),

    lineOptions: {
      styles: [
        { color: `${color}`, opacity: 1, weight: 8 },
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

  routingControl.on("routingstart", () => {
    context.map.getZoom() < 15 && dispatch(routeIsBuildingCreator(true)); // устраняет БАГ с вечным Loader
  });

  routingControl.on("routesfound", (e) => {
    dispatch(routeIsBuildingCreator(false));

    if (vehicle) {
      const { routes } = e;
      const { summary } = routes[0];
      const distance = summary.totalDistance.toFixed();
      dispatch(setDistanceInRouteCreator({ distance, routeId }));
    }
  });

  routingControl.on("routingerror", (e) => {
    dispatch(routeIsBuildingCreator(false));
    new Error("При построении маршрута произошла ошибка", e);
  });
  //---------------------------------------------------------------
  // Этот блок для тестов MapLayout
  const waypointsElement = Array.from(
    document.querySelectorAll(".leaflet-marker-icon")
  );
  for (const i of waypointsElement) {
    i.setAttribute("data-testid", "mapPoint");
  }
  //---------------------------------------------------------------
  return routingControl;
};

function updateRoutineMachineLayer(instance, props, prevProps) {
  if (!props.routeId) {
    // предотвращает зацикливание при dispatch при построении маршрутов не из MapSearch
    return;
  }
  if (props.constructionCoord !== prevProps.constructionCoord) {
    instance.setWaypoints([
      L.latLng(props.constructionCoord),
      L.latLng(props.projectCoord),
    ]);
  }
  if (props.vehicle !== prevProps.vehicle) {
    const router = instance.getRouter();
    router.options.serviceUrl =
      props.vehicle === "foot"
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
