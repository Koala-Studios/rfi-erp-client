import axios from "axios";
import {
  apiStatus,
  FilterElement,
  getQuery,
  IListOptions,
  paramsToObject,
} from "./utils";

export interface ICountItem {
  _id: string;
  product_id: string;
  amount: number;
  amount_proposed: number;
  status: number;
}

export interface IStockCount {
  _id: string;
  date_proposed: Date;
  count_items: [ICountItem];
  status: number;
}

const api = axios.create({
  baseURL: "http://localhost:5000/stock-counts",
});

export const listStockCounts = async (
  count: number,
  page: number
  // q: URLSearchParams | undefined,
  // filters: FilterElement[]
): Promise<IListOptions | null> => {
  // let query = getQuery(q, filters);

  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: {
      count,
      page,
      // query,
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
