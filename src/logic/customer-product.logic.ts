import axios from "axios";
import { apiStatus, FilterElement, getQuery, IListOptions } from "./utils";

interface ICustomerItem {
  _id: string;
  name: string;
  code: string;
}
interface IDiscountRate {
  min_amount: number;
  disc_percent: number;
}

export interface IcustomerProduct {
  _id: string;
}

const api = axios.create({
  baseURL: "http://localhost:5000/customer-products",
});

export const lookupcustomerProduct = async (
  search_value: string
): Promise<IcustomerProduct[] | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: {
      search_value,
    },
  };

  let list: IcustomerProduct[] | null = null;

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

export const listcustomerProducts = async (
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

export const getcustomerProduct = async (
  id: string
): Promise<IcustomerProduct | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: {
      id: id,
    },
  };

  let customer: IcustomerProduct | null = null;

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
  formData: IcustomerProduct
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

export const updateSupplier = async (
  formData: IcustomerProduct
): Promise<boolean> => {
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
