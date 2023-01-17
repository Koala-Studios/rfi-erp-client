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
  user_code: string;
  created_date:string;
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