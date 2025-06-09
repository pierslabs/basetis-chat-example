import { Outlet, Navigate } from 'react-router-dom';
import cookie from 'cookiejs';

const AuthGuard = () => {
  const cookieValue = cookie.get('chat-user-example');
  const isAuth = cookieValue ? true : false;
  return isAuth ? <Outlet /> : <Navigate to='/login' />;
};

export default AuthGuard;
