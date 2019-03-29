import React, { useContext } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch, Link } from "react-router-dom";
import AuthProvider, { AuthContext } from "./AuthContext";
import { ApolloProvider } from "react-apollo";
import { createHttpLink } from "apollo-link-http";
import { setContext } from "apollo-link-context";
import { Query } from "react-apollo";
import { InMemoryCache } from "apollo-cache-inmemory";
import gql from "graphql-tag";

import ApolloClient from "apollo-client";

import "./styles.css";

const Home = props => {
  const auth = useContext(AuthContext);
  return (
    <div>
      {auth.accessToken ? (
        <div>
          <img src={auth.user.picture} style={{ maxWidth: "100px" }} />
          <h1>Welcome, {auth.user.nickname}</h1>
          <Link to="/friends">Get Friends</Link>
        </div>
      ) : (
        <h1>Welcome! Please log in.</h1>
      )}
    </div>
  );
};

const Friends = props => {
  const query = gql`
    query {
      friends {
        name
      }
    }
  `;
  return (
    <Query query={query}>
      {({ loading, error, data }) => {
        if (loading) return <p>Loading...</p>;
        if (error) return <p>Error :(</p>;

        return data.friends.map((f, i) => <p key={i}>{f.name}</p>);
      }}
    </Query>
  );
};

const Navbar = props => {
  const auth = useContext(AuthContext);
  return (
    <div style={{ height: "40px", background: "violet" }}>
      {auth.accessToken ? (
        <button onClick={auth.logout}>Log Out</button>
      ) : (
        <button onClick={auth.login}>Log In</button>
      )}
    </div>
  );
};

const Callback = props => {
  const auth = useContext(AuthContext);
  auth.handleAuthentication();
  return <p>Loading...</p>;
};

const Routes = ({ location }) => {
  return (
    <Switch location={location}>
      <Route path="/home" component={Home} />
      <Route path="/callback" component={Callback} />
      <Route path="/friends" component={Friends} />
    </Switch>
  );
};

const httpLink = createHttpLink({
  uri: "http://localhost:4000/graphql"
});

function makeAuthLink(httpLink, auth) {
  return setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        authorization: auth.accessToken ? `Bearer ${auth.accessToken}` : ""
      }
    };
  }).concat(httpLink);
}

function makeClientWithAuth(auth) {
  return new ApolloClient({
    link: makeAuthLink(httpLink, auth),
    cache: new InMemoryCache()
  });
}

const App = props => {
  return (
    <ApolloProvider client={makeClientWithAuth(props.context)}>
      <Navbar />
      <Routes />
    </ApolloProvider>
  );
};

const AuthApp = props => (
  <BrowserRouter>
    <AuthProvider>
      <AuthContext.Consumer>
        {auth => <App context={auth} />}
      </AuthContext.Consumer>
    </AuthProvider>
  </BrowserRouter>
);

const rootElement = document.getElementById("root");
ReactDOM.render(<AuthApp />, rootElement);
