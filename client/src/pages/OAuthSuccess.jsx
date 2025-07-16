import React, { useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const OAuthSuccess = () => {
  const { setUser, setToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const role = params.get('role');
    const name = params.get('name');

    if (token) {
      setToken(token);
      setUser({ role, name });
      // Redirect based on role
      if (role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } else {
      navigate('/login');
    }
  }, [location, navigate, setToken, setUser]);

  return <div>Logging you in...</div>;
};

export default OAuthSuccess;
