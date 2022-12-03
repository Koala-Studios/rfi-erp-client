import axios from "axios";
import { apiStatus, IListOptions } from "./utils";

export interface IBatching {
  _id: string;
  product_id: string;
  quantity: number;
  date_created: Date;
  batch_code: string;
  status: number;
  product_code: string;
  product_name?: string;
}

const api = axios.create({
  baseURL: "http://localhost:5000/batching",
});

export const listBatching = async (
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
