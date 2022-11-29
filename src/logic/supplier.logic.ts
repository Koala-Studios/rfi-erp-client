import axios from "axios";
import { apiStatus, IListOptions } from "./utils";

export interface ISupplier {
  _id: string;
  name: string;
  code: string;
  contact_name: string;
  address_one: string;
  address_two: string;
  //date_added: Date;
}

const api = axios.create({
  baseURL: "http://localhost:5000/suppliers",
});

export const listSuppliers = async (
  token: string,
  count: number,
  page: number
): Promise<ISupplier[]> => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      count: count,
      page: page,
    },
  };

  let suppliers: ISupplier[] = [];

  await api
    .get("/list", config)
    .then((res) => {
      console.log(res.data);
      if (res.status === apiStatus.OK) {
        suppliers = res.data;
      }
    })
    .catch((err) => {
      console.log(err);
    });

  return suppliers;
};

export const getSupplier = async (
  token: string,
  id: string
): Promise<ISupplier | null> => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      id: id,
    },
  };

  let supplier: ISupplier | null = null;

  await api
    .get("/get", config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        supplier = res.data;
      }
    })
    .catch((err) => {
      console.log(err);
    });

  return supplier;
};
