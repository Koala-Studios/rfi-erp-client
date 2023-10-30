import axios from "axios";
import { apiStatus, FilterElement, getQuery, IListOptions } from "./utils";

export interface IOrderItem {
  _id: string;
  product_id: string;
  product_code: string;
  product_name: string;
  purchased_amount: number;
  received_amount: number;
  unit_price: number;
  sample: boolean;
}

export interface IOrderItemProcess extends IOrderItem {
  lot_number: string;
  process_amount: number;
  container_size: number;
  expiry_date: Date;
}

export interface IPurchaseOrder {
  _id: string;
  notes: string;
  supplier: {
    name: string;
    supplier_id: string;
  };
  date_arrived: string;
  date_purchased: string;
  status: number;
  order_code: string;
  shipping_code: string;
  order_items: IOrderItem[];
}

const api = axios.create({
  baseURL: "http://localhost:5000/purchase-orders",
});

export const listPOs = async (
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

export const listSupplierOrders = async (
  q: URLSearchParams | undefined,
  filters: FilterElement[],
  id: string | undefined
): Promise<IListOptions | null> => {
  let query = getQuery(q, filters);

  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: {
      query,
      supplier_id: id,
    },
  };

  let list: IListOptions | null = null;

  await api
    .get("/list-supplier-orders", config)
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
  id: string
): Promise<IPurchaseOrder | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
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
        new CustomEvent("NotificationEvent", {
          detail: { text: res.data.message },
        })
      );
    })
    .catch((err) => {
      console.log(err);
    });

  return purchase;
};

export const createPurchase = async (
  formData: IPurchaseOrder
): Promise<IPurchaseOrder | null> => {
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
export const updatePurchase = async (
  formData: IPurchaseOrder
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

export const confirmPurchase = async (
  purchase: IPurchaseOrder,
  po_id: string
): Promise<IPurchaseOrder | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
  };
  let rtn = null;
  await api
    .post("/confirm-purchase", purchase, config)
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

export const markPurchaseReceived = async (
  po_id: string
): Promise<IPurchaseOrder | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: { po_id: po_id },
  };

  let rtn = null;

  await api
    .post("/mark-received", po_id, config)
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

export const markPurchaseCancelled = async (
  po_id: string
): Promise<IPurchaseOrder | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: { po_id: po_id },
  };

  let rtn = null;

  await api
    .post("/mark-cancelled", po_id, config)
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

export const handlePurchaseItem = async (
  purchaseItem: IOrderItemProcess,
  quarantine: boolean
): Promise<IPurchaseOrder | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: { quarantine: quarantine },
  };

  let rtn = null;

  await api
    .post("/receive-item", purchaseItem, config)
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
