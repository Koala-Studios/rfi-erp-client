import React, { useEffect } from "react";
import { useLocation, Navigate, useNavigate } from "react-router-dom";

import { ISignIn, signIn } from "../../logic/auth.logic";

interface AuthContextType {
  token: any;
  signin: (user: ISignIn, callback: VoidFunction) => void;
  signout: (callback: VoidFunction) => void;
  loadLocalToken: (callback: Function) => void;
}

export let AuthContext = React.createContext<AuthContextType>(null!);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  let [token, setToken] = React.useState<any>(null);

  const loadLocalToken = (callback: Function) => {
    const local_token = localStorage.getItem("auth_token");

    if (local_token) {
      callback(local_token);
    }
  };

  const signin = (user: ISignIn, callback: VoidFunction) => {
    return signIn(user, (data: any) => {
      setToken(data.token);
      callback();
    });
  };

  const signout = (callback: VoidFunction) => {
    // return fakeAuthProvider.signout(() => {
    //   setUser(null);
    //   callback();
    // });
  };

  let value = { token, loadLocalToken, signin, signout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

function useAuth() {
  return React.useContext(AuthContext);
}

export const RequireAuth = ({ children }: { children: JSX.Element }) => {
  let auth = useAuth();
  let location = useLocation();
  const navigate = useNavigate();

  if (!auth.token) {
    auth.loadLocalToken((local_token: string) => {
      auth.token = local_token;
      navigate(location);
    });
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default AuthProvider;
