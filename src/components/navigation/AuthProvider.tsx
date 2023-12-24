import React, { useEffect, useState } from "react";
import {
  useLocation,
  Navigate,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { ISignIn, signIn } from "../../logic/auth.logic";
import {
  IUser,
  hasPermission,
  loadUser,
  setupPermissions,
} from "../../logic/user.logic";
import { socketDisconnect, initClientSocket } from "../../logic/user.socket";
import NoAccessPage from "../../pages/no-access/NoAccessPage";

interface AuthContextType {
  token: any;
  user: IUser | undefined;
  setUser: any;
  connected: boolean;
  signin: (user: ISignIn, callback: VoidFunction) => void;
  signout: () => void;
  loadLocalToken: (callback: Function) => void;
}

export let AuthContext = React.createContext<AuthContextType>(null!);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  let [token, setToken] = React.useState<any>(null);
  let [currentUser, setCurrentUser] = React.useState<IUser | undefined>();
  let [connected, setConnected] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (connected) return;

    if (currentUser) {
      console.log("user", currentUser);
      initClientSocket(token, currentUser._id, setConnected);
    } else {
      console.log(token);
      loadLocalToken((local_token: string) => {
        console.log("token", local_token);

        loadUser(local_token).then(async (res: any) => {
          if (res) {
            console.log("RES is", res);
            res.permissions = setupPermissions(res.user, res.user_roles);
            console.log("permissions", res.permissions);
            setToken(local_token);

            let newUser: IUser = {
              _id: res.user._id,
              notifications: res.user.notifications,
              email: res.user.email,
              username: res.user.username,
              roles: res.user.roles,
            };
            newUser.permissions = setupPermissions(newUser, res.user_roles);

            setCurrentUser(newUser);
            navigate(location.pathname + location.search);
          } else {
            localStorage.removeItem("auth_token");
            navigate("/login?returnUrl=" + location.pathname + location.search);
          }
        });
      });
    }
  }, [currentUser]);

  const loadLocalToken = (callback: Function) => {
    console.log("hello");
    const local_token = localStorage.getItem("auth_token");

    if (local_token) {
      callback(local_token);
    }
  };

  const signin = (user: ISignIn, callback: VoidFunction) => {
    return signIn(user, (data: any) => {
      setToken(data.token);

      console.log("new user", data);
      let newUser: IUser = {
        _id: data.user.user._id,
        notifications: data.user.user.notifications,
        email: data.user.user.email,
        username: data.user.user.username,
        roles: data.user.user.roles,
      };
      newUser.permissions = setupPermissions(newUser, data.user.user_roles);
      setCurrentUser(newUser);

      callback();
    });
  };

  const signout = () => {
    socketDisconnect();
    localStorage.removeItem("auth_token");
    window.location.replace("/");
    // return fakeAuthProvider.signout(() => {
    //   setUser(null);
    //   callback();
    // });
  };

  let value = {
    token,
    user: currentUser,
    setUser: setCurrentUser,
    connected: connected,
    loadLocalToken,
    signin,
    signout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

function useAuth() {
  return React.useContext(AuthContext);
}

interface RequireAuthProps {
  children: JSX.Element;
  permission: string;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({
  permission,
  children,
}) => {
  let auth = useAuth();
  let location = useLocation();
  const navigate = useNavigate();
  if (!auth.token) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    if (location.pathname !== "/login") {
      return (
        <Navigate
          to={"/login?returnUrl=" + location.pathname + location.search}
          state={{ from: location }}
          replace
        />
      );
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasPermission(auth.user!, permission)) {
    return <NoAccessPage />;
  }

  return children;
};

export default AuthProvider;
