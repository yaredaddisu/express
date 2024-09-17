import { createContext, useContext, useState } from "react";

const StateContext = createContext({
  currentUser: null,
  token: null,
  notification: null,
  setUser: () => {},
  setToken: () => {},
  setNotification: () => {}
});

export const ContextProvider = ({ children }) => {
  // Initialize user state from localStorage
  const [user, _setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Initialize token state from localStorage
  const [token, _setToken] = useState(localStorage.getItem('ACCESS_TOKEN'));
  const [notification, _setNotification] = useState('');

  const setToken = (token) => {
    _setToken(token);
    if (token) {
      localStorage.setItem('ACCESS_TOKEN', token);
    } else {
      localStorage.removeItem('ACCESS_TOKEN');
    }
  };

  const setUser = (user) => {
    _setUser(user);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  };

  const setNotification = (message) => {
    _setNotification(message);

    setTimeout(() => {
      _setNotification('');
    }, 5000);
  };

  return (
    <StateContext.Provider value={{
      user,
      setUser,
      token,
      setToken,
      notification,
      setNotification
    }}>
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
