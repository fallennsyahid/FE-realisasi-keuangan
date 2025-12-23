import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { authentication } from '../store/authentication';

function Before(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const next = new URLSearchParams(location.search).get('next');
  const { auth, user } = useRecoilValue(authentication);
  useEffect(() => {
    if (auth) {
      if (next === null) {
        if (user.role === 'bpjs' || user.role === 'view_bpjs') {
          navigate('/bpjs-kesehatan');
        } else {
          navigate('/');
        }
      } else {
        navigate(next);
      }
    }
  }, [auth, user, navigate, next]);

  return props.children;
}

export default Before;
