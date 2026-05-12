import { createContext, useContext } from 'react';

const initialState = {};

export const AuthContext = createContext(initialState);

export const useAuth = () => {
  return useContext(AuthContext);
};
