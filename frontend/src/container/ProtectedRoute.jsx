import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { userInfo } = useSelector((state) => state.auth);

  // If no user info, redirect to landing page
  if (!userInfo) {
    return <Navigate to='/' replace />;
  }

  return children;
};

export default ProtectedRoute;
