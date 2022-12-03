import axios from "axios";
import { apiStatus, IListOptions } from "./utils";

export interface IProduct {
  _id: string;
  product_code: string;
  name: string;
  versions: number;
  approved_version: number;
  cost: number;
  date_created: Date;
  status: number;
}

const api = axios.create({
  baseURL: "http://localhost:5000/products",
});



export const listProducts = async (
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

export const getProduct = async (
  token: string,
  id: string
): Promise<IProduct | null> => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      id: id,
    },
  };

  let product: IProduct | null = null;

  await api
    .get("/get", config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        product = res.data;
      }
    })
    .catch((err) => {
      console.log(err);
    });

  return product;
};
