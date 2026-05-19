import { Navigate } from "react-router-dom";
import SignIn from "../components/SignIn";
import Home from "../components/Home";
import AdminHostStudio from "../components/AdminHostStudio";

export const routers = [
  {
    path: '/',
    key: 'root',
    element: () => <Navigate to="/sign-in" replace />,
    exact: true,
    children: [],
    auth: false,
  },
  {
    path: '/sign-in',
    key: 'sign-in',
    element: SignIn,
    exact: true,
    children: [],
    auth: false,
  },
  {
    path: '/home',
    key: 'home',
    element: Home,
    exact: true,
    children: [],
    auth: true,
  },
  {
    path: '/admin-host-studio/:_id',
    key: 'admin-host-studio/:_id',
    element: AdminHostStudio,
    exact: true,
    children: [],
    auth: true,
  },
  {
    path: '*',
    key: 'not-found',
    element: () => <Navigate to="/sign-in" replace />,
    exact: false,
    children: [],
    auth: false,
  },

]