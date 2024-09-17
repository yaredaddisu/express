import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const useSessionTimeout = (timeoutDuration = 600000) => { // Default 10 minutes
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const logout = () => {
    localStorage.removeItem('userToken'); // or sessionStorage.removeItem('userToken');
    navigate('/login'); // Redirect to login page
  };

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(logout, timeoutDuration);
  };

  useEffect(() => {
    const handleActivity = () => resetTimer();

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);

    resetTimer();

    return () => {
      clearTimeout(timerRef.current);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, []);

  return null;
};

export default useSessionTimeout;
