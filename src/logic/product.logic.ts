import axios from "axios";
import { ObjectId } from "bson";
import { apiStatus, IListOptions } from "./utils";

// export interface IProduct {
//   _id: string;
//   product_code: string;
//   name: string;
//   versions: number;
//   approved_version: number;
//   cost: number;
//   date_created?: string;
//   status: number;
// }

interface IRegulatoryContainer {
  fda_status?: number;
  cpl_hazard?: string;
  fema_number?: number;
  ttb_status?: string;
  eu_status?: number;
  organic?: boolean;
  kosher?: boolean;
}

interface IProductCustomers {
  customer_id: ObjectId;
  name: string;
}
interface IProductContainer {
  batch_code: string;
  on_hand: number;
  in_transit: number;
  on_order: number;
  allocated: number;
  on_hold: number;
  quarantined: number;
}

export interface IProduct {
  _id: string;
  name: string;
  description: string;
  rating: number | null;
  product_code: string;
  is_raw_mat?: boolean;
  for_sale?: boolean;
  cost: number;
  stock?: IProductContainer;
  customers: IProductCustomers[];
  regulatory: IRegulatoryContainer;
  versions: number;
  status: number;
  approved_version: number;
  rec_dose_rate?: number;
  product_type: { name: string; _id: string } | null;
}

const api = axios.create({
  baseURL: "http://localhost:5000/products",
});

export const listProducts = async (
  count: number,
  page: number,
  approved?: boolean
): Promise<IListOptions | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: {
      count,
      page,
      approved,
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

export const getProduct = async (id: string): Promise<IProduct | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
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

export const createProduct = async (
  formData: IProduct
): Promise<IProduct  | null> => {
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
export const updateProduct = async (formData: IProduct): Promise<boolean> => {
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
