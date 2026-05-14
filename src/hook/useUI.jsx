import { createContext, useContext } from 'react';

const initialState = {};

export const UIContext = createContext(initialState);

export const useUI = () => {
  return useContext(UIContext);
};
