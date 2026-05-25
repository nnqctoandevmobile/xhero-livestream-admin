import { Route, Routes } from "react-router-dom";
import PublicRoute from "./PublicRoute";
import ProtectRoute from "./ProtectRoute";
import { routers } from "./config";

function RouteComponent() {
  function renderRoute({ element: Element, children, key, ...params }, index) {
    const routeKey = key || index;
    if (children && children.length > 0) {
      const parentElement = params?.auth ? (
        <ProtectRoute>
          <Element />
        </ProtectRoute>
      ) : (
        <Element />
      );

      return (
        <Route
          key={routeKey}
          {...params}
          element={parentElement}>
          {children
            // .filter((i) => pathAvailable.includes(i.path))
            .map((routeChild, index) => {
              return renderRoute(routeChild, index);
            })}
        </Route>
      );
    }

    if (params?.auth) {
      return (
        <Route
          key={routeKey}
          {...params}
          element={
            <ProtectRoute>
              <Element />
            </ProtectRoute>
          }
        />
      );
    }

    return (
      <Route
        key={routeKey}
        {...params}
        element={
          <PublicRoute>
            <Element />
          </PublicRoute>
        }
      />
    );
  }
  return (
    <Routes>
      {routers.map((route, index) => {
        return renderRoute(route, index);
      })}
    </Routes>
  );
}

export default RouteComponent;
