import axios from "axios";
import { apiStatus, IListOptions } from "./utils";

export interface ICustomer {
  _id: string;
  name: string;
  code?: string;
  contact_name?: string;
  address_one?: string;
  address_two?: string;
  phone?: string;
  email?: string;
  lead_time?: string;
}

const api = axios.create({
  baseURL: "http://localhost:5000/customers",
});

export const listCustomers = async (
  token: string,
  count: number,
  page: number
): Promise<ICustomer[]> => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      count: count,
      page: page,
    },
  };

  let customers: ICustomer[] = [];

  await api
    .get("/list", config)
    .then((res) => {
      console.log(res.data);
      if (res.status === apiStatus.OK) {
        customers = res.data.res.docs;
      }
    })
    .catch((err) => {
      console.log(err);
    });

  return customers;
};

export const getCustomer = async (
  token: string,
  id: string
): Promise<ICustomer | null> => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      id: id,
    },
  };

  let customer: ICustomer | null = null;

  await api
    .get("/get", config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        customer = res.data;
      }
    })
    .catch((err) => {
      console.log(err);
    });

  return customer;
};

export const lookupCustomer = async (
  //TODO: Not finished
  token: string,
  search_value: string
): Promise<ICustomer[] | null> => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      search_value,
    },
  };

  let list: ICustomer[] | null = null;

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

//returns an Id
export const createCustomer = async (
  token: string,
  formData: ICustomer
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
