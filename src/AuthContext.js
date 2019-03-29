import React, { createContext, Component } from 'react';
import Auth0 from 'auth0-js';
import { withRouter } from 'react-router-dom';

export const AuthContext = createContext();

class AuthProvider extends Component {
  state = {
    accessToken: '',
    idToken: '',
    expiresAt: '',
    user: {}
  };

  auth0 = new Auth0.WebAuth({
    domain: 'cienki.auth0.com',
    clientID: 'aVxnlIUdoL1OqUUo676GPmeRs3Y2y2LW',
    redirectUri: 'http://localhost:3000/callback',
    responseType: 'token id_token',
    audience: 'https://react-demo.com',
    scope: 'openid profile'
  });

  login() {
    this.auth0.authorize();
  }

  handleAuthentication() {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);
        this.props.history.push('/home');
      } else if (err) {
        console.log(err);
      }
    });
  }

  setSession(authResult) {
    localStorage.setItem('isLoggedIn', 'true');

    // Set the time that the access token will expire at
    let expiresAt = authResult.expiresIn * 1000 + new Date().getTime();

    const { name, nickname, picture } = authResult.idTokenPayload;

    this.setState({
      accessToken: authResult.accessToken,
      idToken: authResult.idToken,
      expiresAt,
      user: {
        name,
        nickname,
        picture
      }
    });
  }

  renewSession() {
    this.auth0.checkSession({}, (err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);
      } else if (err) {
        console.log(err);
        this.logout();
      }
    });
  }

  logout() {
    this.setState({
      accessToken: '',
      idToken: null,
      expiresAt: null,
      user: null
    });

    localStorage.removeItem('isLoggedIn');

    // navigate to the home route
    // history.replace('/home');
  }

  isAuthenticated() {
    let expiresAt = this.expiresAt;
    return new Date().getTime() < expiresAt;
  }

  wantsAuthentication() {
    return localStorage.getItem('isLoggedIn') === 'true';
  }

  render() {
    return (
      <AuthContext.Provider
        value={{
          user: this.state.user,
          login: this.login.bind(this),
          logout: this.logout.bind(this),
          isAuthenticated: this.isAuthenticated.bind(this),
          handleAuthentication: this.handleAuthentication.bind(this),
          accessToken: this.state.accessToken
        }}
      >
        {this.props.children}
      </AuthContext.Provider>
    );
  }
}

export default withRouter(AuthProvider);
