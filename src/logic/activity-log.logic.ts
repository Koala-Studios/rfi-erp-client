import axios, { AxiosRequestConfig } from "axios";
import { apiStatus, FilterElement, getQuery, IListOptions } from "./utils";
import PERMISSIONS from "./config.permissions";

const api = axios.create({
  baseURL: "http://localhost:5000/activity",
});

export const listActivityLog = async (
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
