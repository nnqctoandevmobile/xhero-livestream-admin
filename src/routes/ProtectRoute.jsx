import { Navigate } from 'react-router-dom';
import { useAuth } from '../hook/useAuth';

function ProtectRoute({ children }) {
  const { isLogged } = useAuth();
  if (!isLogged) {
    return (
      <Navigate
        to="/sign-in"
        replace
      />
    );
  }

  return children;
}

export default ProtectRoute;
