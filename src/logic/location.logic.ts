import axios from "axios";
import { apiStatus, FilterElement, getQuery, IListOptions } from "./utils";
import config from "../config/config";

export interface ILocation {
  _id: string;
  name: string;
  code: string;
  description: string;
  total_containers: number;
  created_date: string;
}

const api = axios.create({
  baseURL: config.API.BASE_URL + config.API.PORT + "/location",
});

export const getLocation = async (id: string): Promise<ILocation | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: {
      location_id: id,
    },
  };

  let location: ILocation | null = null;
  await api
    .get("/get", config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        location = res.data.res;
        console.log(res);
      }
    })
    .catch((err) => {
      console.log(err);
    });
  return location;
};

export const listLocations = async (
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

export const lookupLocation = async (
  search_value: string
): Promise<ILocation[] | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: {
      search_value,
    },
  };

  let list: ILocation[] | null = null;

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

export const createLocation = async (
  formData: ILocation
): Promise<string | null> => {
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
export const updateLocation = async (formData: ILocation): Promise<boolean> => {
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
