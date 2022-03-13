import React from "react";
import { useLocation, Navigate } from "react-router-dom";

import { ISignIn, signIn } from "../../logic/auth.logic";

interface AuthContextType {
  token: any;
  signin: (user: ISignIn, callback: VoidFunction) => void;
  signout: (callback: VoidFunction) => void;
}

export let AuthContext = React.createContext<AuthContextType>(null!);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  let [token, setToken] = React.useState<any>(null);

  let signin = (user: ISignIn, callback: VoidFunction) => {
    return signIn(user, (data: any) => {
      setToken(data.token);
      callback();
    });
  };

  let signout = (callback: VoidFunction) => {
    // return fakeAuthProvider.signout(() => {
    //   setUser(null);
    //   callback();
    // });
  };

  let value = { token, signin, signout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

function useAuth() {
  return React.useContext(AuthContext);
}

export const RequireAuth = ({ children }: { children: JSX.Element }) => {
  let auth = useAuth();
  let location = useLocation();

  if (!auth.token) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default AuthProvider;
