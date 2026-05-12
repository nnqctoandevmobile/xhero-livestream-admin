import SignIn from "../components/SignIn";
import Home from "../components/Home";

export const routers = [
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
]