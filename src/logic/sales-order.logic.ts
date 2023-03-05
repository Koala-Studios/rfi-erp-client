import axios from "axios";
import { apiStatus, IListOptions } from "./utils";

interface IOrderItem {
  product_code: string;
  material_name: string;
  lot_number: string;
  amount: number;
  price: number;
  status: number;
  material_id: string;
}
export interface ISalesOrder {
  _id: string;
  supplier_code: string;
  supplier: string;
  date_arrived: Date;
  date_purchased: Date;
  status: Number;
  order_code: string;

  order_items: [IOrderItem];
}

const api = axios.create({
  baseURL: "http://localhost:5000/sales-orders",
});

export const listSalesOrders = async (
  count: number,
  page: number
): Promise<IListOptions | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
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

export const getSalesOrder = async (
  id: string
): Promise<ISalesOrder | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: {
      id: id,
    },
  };

  let sales_order: ISalesOrder | null = null;

  await api
    .get("/get", config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        sales_order = res.data.res;
      }
      window.dispatchEvent(
        new CustomEvent("NotificationEvent", {
          detail: { text: res.data.message },
        })
      );
    })
    .catch((err) => {
      console.log(err);
    });

  return sales_order;
};
