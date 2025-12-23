import { atom, selector } from 'recoil';
import axios from '../variable/axios';

const authentication = atom({
  key: 'authentication',
  default: selector({
    key: 'default-authentication',
    get: async () => {
      let auth = false;
      let user = null;
      try {
        const { data } = await axios.get(`auth/user`);
        auth = data.meta.status === 'success';
        user = data.data;
      } catch {
        auth = false;
        user = null;
      }
      return {
        auth,
        user,
      };
    },
  }),
});

export { authentication };
