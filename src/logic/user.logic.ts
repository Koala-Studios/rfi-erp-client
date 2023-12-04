import axios, { AxiosRequestConfig } from "axios";
import { apiStatus, FilterElement, getQuery, IListOptions } from "./utils";
import PERMISSIONS from "./config.permissions";

export interface INotification {
  _id: string;
  n_type: number; //notification type;
  text?: string;
  ref?: string; //any reference id needed for notification
  sender?: string;
}
export interface IUserRole {
  _id: string;
  name: string;
  permissions: string;
}

export interface IUser {
  _id: string;
  email: string;
  username: string;
  user_code?: string;
  created_date?: string;
  notifications?: INotification[];
  roles: IUserRole[];
  permissions?: string[];
  //TODO:ROLES & DATES
}

export interface IUserRole {
  _id: string;
  name: string;
}

const api = axios.create({
  baseURL: "http://localhost:5000/user",
});

export const getUser = async (id: string): Promise<IUser | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: {
      id: id,
    },
  };

  let user: IUser | null = null;
  await api
    .get("/getUser", config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        user = res.data;
      }
    })
    .catch((err) => {
      console.log(err);
    });
  return user;
};

export const listUsers = async (
  q: URLSearchParams | undefined,
  filters: FilterElement[]
): Promise<IListOptions | null> => {
  let query = getQuery(q, filters);

  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: {
      query,
    },
  };

  let list: IListOptions | null = null;

  await api
    .get("/list", config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        list = res.data.res;
      }
    })
    .catch((err) => {
      console.log(err);
    });

  return list;
};

export const loadUser = async (token: string): Promise<IUser | undefined> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
  };

  let user: IUser | undefined;
  await api
    .get("/loadUser", config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        console.log("load user", res.data);
        user = res.data;
      }
    })
    .catch((err) => {
      console.log(err);
    });
  return user;
};

export const setupPermissions = (user: IUser): string[] => {
  let permissions: string[] = [];

  if (!user.roles) return [];

  for (let i = 0; i < user.roles.length; i++) {
    const role = user.roles[i];

    if (role.name === "Admin") return [PERMISSIONS.admin];

    for (let j = 0; j < role.permissions.length; j++) {
      const perm = role.permissions[j];

      if (!permissions.includes(perm)) {
        permissions.push(perm);
      }
    }
  }

  return permissions;
};

export const lookupUser = async (
  search_value: string
): Promise<IUser[] | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: {
      search_value,
    },
  };

  let list: IUser[] | null = null;

  await api
    .get("/lookup", config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        list = res.data.res;
      }
    })
    .catch((err) => {
      console.log(err);
    });
  return list;
};

export const lookupRoles = async (
  search_value: string
): Promise<IUser[] | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: {
      search_value,
    },
  };

  let list: IUser[] | null = null;

  await api
    .get("/role-lookup", config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        list = res.data.res;
      }
    })
    .catch((err) => {
      console.log(err);
    });
  return list;
};

export const createUser = async (formData: IUser): Promise<string | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
  };

  let rtn = null;

  await api
    .post("/create", formData, config)
    .then((res) => {
      console.log(res);
      if (res.status === apiStatus.CREATED) {
        console.log(res.data);
        rtn = res.data;
      }
    })
    .catch((err) => {
      console.log(err);
    });

  return rtn;
};
export const updateUser = async (formData: IUser): Promise<boolean> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
  };

  let rtn = false;

  await api
    .post("/update", formData, config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        rtn = true;
      }
    })
    .catch((err) => {
      console.log(err);
    });

  return rtn;
};

export const hasPermission = (user: IUser, permission: string) => {
  if (user.permissions!.includes(PERMISSIONS.admin)) return true;

  return user.permissions!.includes(permission);
};
