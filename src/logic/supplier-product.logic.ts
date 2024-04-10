import axios from "axios";
import { apiStatus, FilterElement, getQuery, IListOptions } from "./utils";
import config from "../config/config";

interface ISupplierItem {
  _id: string;
  name: string;
  code: string;
}
interface IDiscountRate {
  min_amount: number;
  disc_percent: number;
}

export interface ISupplierProduct {
  _id: string;
  product_id: string;
  supplier: ISupplierItem;
  supplier_sku: string;
  product_code: string;
  name: string;
  cost: number;
  discount_rates: IDiscountRate[];
  description: string;
  cas_number?: string;
}

const api = axios.create({
  baseURL: config.API.BASE_URL + config.API.PORT + "/supplier-products",
});

export const lookupSupplierProduct = async (
  search_value: string,
  supplier_id: string
): Promise<ISupplierProduct[] | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: {
      search_value,
      supplier_id,
    },
  };

  let list: ISupplierProduct[] | null = null;

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

export const listSupplierProducts = async (
  q: URLSearchParams | undefined,
  filters: FilterElement[],
  supplier_id?: string,
  product_id?: string
): Promise<IListOptions | null> => {
  let query = getQuery(q, filters);

  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: {
      query,
      supplier_id,
      product_id,
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

export const getSupplierProduct = async (
  id: string
): Promise<ISupplierProduct | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: {
      id: id,
    },
  };

  let supplier: ISupplierProduct | null = null;

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

export const createSupplierProduct = async (
  formData: ISupplierProduct
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
  formData: ISupplierProduct
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
