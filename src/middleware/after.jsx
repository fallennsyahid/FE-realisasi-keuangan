import { Navigate } from 'react-router';
import { useRecoilValue } from 'recoil';
import { authentication } from '../store/authentication';

function After(props) {
  const { children } = { ...props };
  const { auth } = useRecoilValue(authentication);
  if (!auth) {
    return <Navigate to={`/login`} />;
  }
  return children;
}

export default After;
