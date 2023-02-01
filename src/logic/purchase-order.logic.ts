import axios from "axios";
import { apiStatus, IListOptions } from "./utils";

export interface IOrderItem {
  _id:string;
  product_id: string;
  product_code: string;
  product_name: string;
  purchased_amount: number;
  received_amount: number;
  unit_price: number;
}
export interface IPurchaseOrder {
  _id: string;
  supplier: {
    name: string,
    supplier_id: string
  },
  date_arrived: string;
  date_purchased: string;
  status: number;
  order_code: string;
  notes: string;
  order_items: IOrderItem[];
}

const api = axios.create({
  baseURL: "http://localhost:5000/purchase-orders",
});

export const listPOs = async (
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

export const getPurchase = async (
  token: string,
  id: string
): Promise<IPurchaseOrder | null> => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      id: id,
    },
  };

  let purchase: IPurchaseOrder | null = null;

  await api
    .get("/get", config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        purchase = res.data.res;
      }
      window.dispatchEvent(
        new CustomEvent("NotificationEvent", { detail: res.data.message })
      );
    })
    .catch((err) => {
      console.log(err);
    });

  return purchase;
};



export const createPurchase = async (
  token: string,
  formData: IPurchaseOrder
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
export const updatePurchase = async (
  token: string,
  formData: IPurchaseOrder
): Promise<boolean> => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
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
