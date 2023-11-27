import axios from "axios";
import { apiStatus, FilterElement, getQuery, IListOptions } from "./utils";

export interface IOrderItem {
  _id: string;
  product_id: string;
  product_code: string;
  product_name: string;
  batch_id: string;
  sold_amount: number;
  sample: boolean;
  shipped_amount: number;
  unit_price: number;
  status: number;
}

export const itemStatus = {
  PENDING: 0,
  SCHEDULED: 1,
  IN_PROGRESS: 2,
  WAITING_QC: 3,
  WAITING_SHIPPING: 4,
  SHIPPED: 5,
};

export interface IOrderItemProcess extends IOrderItem {
  process_amount: number;
  order_id: string;
  date_needed: string;
  product_id: string;
}

interface ISalesCustomer {
  _id: string;
  code: string;
  name: string;
}
export interface ISalesOrder {
  _id: string;
  customer: ISalesCustomer;
  date_shipped: string;
  shipping_code: string;
  date_sold: string;
  status: number;
  notes: string;
  order_code: string;
  order_items: IOrderItem[];
}

const api = axios.create({
  baseURL: "http://localhost:5000/sales-orders",
});

export const listSalesOrders = async (
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

export const createSales = async (
  formData: ISalesOrder
): Promise<ISalesOrder | null> => {
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
export const updateSales = async (formData: ISalesOrder): Promise<boolean> => {
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

export const confirmSales = async (
  sales: ISalesOrder,
  sales_id: string
): Promise<ISalesOrder | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
  };
  let rtn = null;
  await api
    .post("/confirm-sales", sales, config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        window.dispatchEvent(
          new CustomEvent("NotificationEvent", {
            detail: { text: res.data.message },
          })
        );
        rtn = res.data.res;
      }
    })
    .catch((err) => {
      console.log(err);
    });

  return rtn;
};

export const markSalesReceived = async (
  sales_id: string
): Promise<ISalesOrder | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: { sales_id: sales_id },
  };

  let rtn = null;

  await api
    .post("/mark-received", sales_id, config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        window.dispatchEvent(
          new CustomEvent("NotificationEvent", {
            detail: { text: res.data.message },
          })
        );
        rtn = res.data.res;
      }
    })
    .catch((err) => {
      console.log(err);
    });

  return rtn;
};

export const markSalesCancelled = async (
  sales_id: string
): Promise<ISalesOrder | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: { sales_id: sales_id },
  };

  let rtn = null;

  await api
    .post("/mark-cancelled", sales_id, config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        window.dispatchEvent(
          new CustomEvent("NotificationEvent", {
            detail: { text: res.data.message },
          })
        );
        rtn = res.data.res;
      }
    })
    .catch((err) => {
      console.log(err);
    });

  return rtn;
};

export const handleSalesItem = async (
  salesItem: IOrderItemProcess,
  order_id: string
): Promise<ISalesOrder | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: { order_id },
  };

  let rtn = null;

  await api
    .post("/handle-item", salesItem, config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        window.dispatchEvent(
          new CustomEvent("NotificationEvent", {
            detail: { text: res.data.message },
          })
        );
        rtn = res.data.res;
      }
    })
    .catch((err) => {
      console.log(err);
    });

  return rtn;
};
