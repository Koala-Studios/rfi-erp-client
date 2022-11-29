import axios, { AxiosRequestConfig } from "axios";
import { apiStatus, IListOptions } from "./utils";

export interface INotification {
  _id: string;
  action: number;
  object: string;
}

export interface IUser {
  _id: string;
  email: string;
  username: string;
}

const api = axios.create({
  baseURL: "http://localhost:5000/user",
});

export const getUser = async (token: string | null, SetStoreCallback: any) => {
  if (!token) return false;
  let success = false;

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };
  await api
    .get("/getUser", config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        success = true;
        SetStoreCallback(res.data);
      }
    })
    .catch((err) => {
      console.log(err);
    });
  return success;
};

export const listUsers = async (
  token: string,
  count: number,
  page: number
): Promise<IUser[]> => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      count: count,
      page: page,
    },
  };

  let users: IUser[] = [];

  await api
    .get("/list", config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        users = res.data;
      }
    })
    .catch((err) => {
      console.log(err);
    });

  return users;
};

// export const getNotifications = async (
// 	Store: IStore
// ): Promise<INotification[]> => {
// 	let notifications: INotification[] = [];

// 	const config = {
// 		headers: { Authorization: `Bearer ${Store.token}` },
// 	};
// 	await api
// 		.get("/user/getNotifications", config)
// 		.then((res) => {
// 			if (res.status === apiStatus.OK) {
// 				notifications = res.data;
// 			}
// 		})
// 		.catch((err) => {
// 			console.log(err);
// 		});

// 	return notifications;
// };
