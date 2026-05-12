import { useMemo, useState, useCallback } from 'react';
import { AuthContext } from '../hook/useAuth';

function AuthProvider({ children }) {
  // Only get user from localStorage as requested
  const [user, setUser] = useState(() => {
    try {
      const userInfo = localStorage.getItem('USER_INFO');
      return userInfo ? JSON.parse(userInfo) : null;
    } catch {
      return null;
    }
  });

  // isLogged is true if user exists in localStorage
  const isLogged = !!user;

  // Provide a basic signout function to clear the storage
  const signout = useCallback(() => {
    localStorage.removeItem('USER_INFO');
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('USER_INFO');
    setUser(null);
  }, []);

  const params = useMemo(() => {
    return {
      user,
      setUser,
      isLogged,
      signout,
    };
  }, [user, isLogged, signout, setUser]);

  return <AuthContext.Provider value={params}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
