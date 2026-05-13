import NewService from "../core/apisService";

class AuthService extends NewService {
  constructor(props = {}) {
    super(props);
  }

  actSignin = ({ username, password }) => {
    return this.post(this.apiUlr() + '/admin/authenticate', {
      username,
      password,
    });
  };

  // actSignout = () => {
  //   return this.post('/auth/logout');
  // };

  actGetOPTForgetPassWord = (payload) => {
    return this.get(this.apiUlr() + '/users/otp', payload);
  };

  actPostVerifition = (payload) => {
    return this.post(this.apiUlr() + '/users/password-reset/otp-verification', payload);
  };

  actputResetPass = (payload) => {
    return this.put(this.apiUlr() + '/users/password-reset', payload);
  };

  // actForgetPassWord = (payload) => {
  //   return this.post(this.apiUlr() + '/admin/forgot', payload);
  // };
}

export default AuthService;
