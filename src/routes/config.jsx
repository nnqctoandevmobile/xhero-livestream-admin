import { Navigate } from "react-router-dom";
import SignIn from "../components/SignIn";
import Home from "../components/Home";
import AdminHostStudio from "../components/AdminHostStudio";

// Import dashboard components
import SessionList from "../components/Home/components/SessionList";
import NewSession from "../components/Home/components/NewSession";
import ConsultingForms from "../components/Home/components/ConsultingForms";
import VideoPlayback from "../components/Home/components/VideoPlayback";
import Statistics from "../components/Home/components/Statistics";

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
    children: [
      {
        index: true,
        key: 'session-list',
        element: SessionList,
        auth: true,
      },
      {
        path: 'new',
        key: 'new-session',
        element: NewSession,
        auth: true,
      },
      {
        path: 'consulting',
        key: 'consulting-forms',
        element: ConsultingForms,
        auth: true,
      },
      {
        path: 'playback',
        key: 'video-playback',
        element: VideoPlayback,
        auth: true,
      },
      {
        path: 'statistics',
        key: 'statistics',
        element: Statistics,
        auth: true,
      },
      {
        path: 'statistics/:roomId',
        key: 'statistics-room',
        element: Statistics,
        auth: true,
      },
    ],
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