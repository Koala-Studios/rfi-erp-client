import axios from "axios";
import { apiStatus, FilterElement, getQuery, IListOptions } from "./utils";
import config from "../config/config";

interface IProductItem {
  _id: string;
  product_code: string;
  name: string;
}
interface ICustomerItem {
  _id: string;
  name: string;
  code: string;
}

export interface ICustomerProduct {
  product: IProductItem;
  customer: ICustomerItem;
  rec_dose: number;
  customer_sku: string;
  c_prod_name: string;
  price: number;
  discount_rates: IDiscountRate[];
  description: string;
}
interface IDiscountRate {
  min_amount: number;
  percent: number;
}

const api = axios.create({
  baseURL: config.API.BASE_URL + config.API.PORT + "/customer-products",
});

export const lookupCustomerProduct = async (
  search_value: string,
  customer_id: string
): Promise<ICustomerProduct[] | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: {
      search_value,
      customer_id,
    },
  };

  let list: ICustomerProduct[] | null = null;

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

export const listCustomerProducts = async (
  q: URLSearchParams | undefined,
  filters: FilterElement[],
  customer_id?: string
): Promise<IListOptions | null> => {
  let query = getQuery(q, filters);

  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: {
      query,
      customer_id,
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

export const getcustomerProduct = async (
  id: string
): Promise<ICustomerProduct | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: {
      id: id,
    },
  };

  let customer: ICustomerProduct | null = null;

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

export const createcustomerProduct = async (
  formData: ICustomerProduct
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

export const updateCustomerProducts = async (
  formData: ICustomerProduct[]
): Promise<any | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
  };

  let rtn = null;

  await api
    .post("/update", formData, config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        rtn = res;
      }
    })
    .catch((err) => {
      console.log(err);
    });

  return rtn;
};
