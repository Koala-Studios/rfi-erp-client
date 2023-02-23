import axios, { AxiosRequestConfig } from "axios";
import { apiStatus, IListOptions } from "./utils";

export interface INotification {
  _id: string;
  n_type: number; //notification type;
  text?: string;
  ref?: string; //any reference id needed for notification
  sender?: string;
}

export interface IUser {
  _id: string;
  email: string;
  username: string;
  user_code?: string;
  created_date: string;
  notifications?: INotification[];
  //TODO:ROLES & DATES
}

const api = axios.create({
  baseURL: "http://localhost:5000/user",
});

export const getUser = async (
  token: string,
  id: string
): Promise<IUser | null> => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
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
  token: string,
  count: number,
  page: number
): Promise<IListOptions | null> => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      count,
      page,
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
    headers: { Authorization: `Bearer ${token}` },
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

export const lookupUser = async (
  //TODO: Not finished
  token: string,
  search_value: string
): Promise<IUser[] | null> => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
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

export const createUser = async (
  token: string,
  formData: IUser
): Promise<string | null> => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
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
export const updateUser = async (
  token: string,
  formData: IUser
): Promise<boolean> => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
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
