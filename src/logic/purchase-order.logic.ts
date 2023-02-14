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

export interface IOrderItemProcess extends IOrderItem {
  lot_number:string,
  process_amount:number,
  container_size:number,
  expiry_date:Date,
}


export interface IPurchaseOrder {
  _id: string;
  notes: string;
  supplier: {
    name: string,
    supplier_id: string
  },
  date_arrived: string;
  date_purchased: string;
  status: number;
  order_code: string;
  shipping_code:string;
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
        new CustomEvent("NotificationEvent", { detail: { text: res.data.message} })
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

export const confirmPurchase = async (
  token: string,
  purchase: IPurchaseOrder,
  po_id:string,
): Promise<IPurchaseOrder | null> => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
    // params: {po_id: po_id}
  };
  let rtn = null
  await api
    .post("/confirm-purchase", purchase, config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        console.log(res);
        rtn = res.data;
      }

    })
    .catch((err) => {
      console.log(err);
    });

  return rtn;
};

export const markPurchaseReceived = async (
  token: string,
  po_id:string,
): Promise<IPurchaseOrder | null> => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
    params: {po_id: po_id}
  };


  let rtn = null;

  await api
    .post("/mark-received", po_id,config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        window.dispatchEvent(
          new CustomEvent("NotificationEvent", { detail: { text: res.data.message} })
        );
        rtn = res.data;
      }

    })
    .catch((err) => {
      console.log(err);
    });

  return rtn;
};

export const markPurchaseCancelled = async (
  token: string,
  po_id:string,
): Promise<IPurchaseOrder | null> => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
    params: {po_id: po_id}
  };

  let rtn = null;

  await api
    .post("/mark-cancelled", po_id, config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        window.dispatchEvent(
          new CustomEvent("NotificationEvent", { detail: { text: res.data.message} })
        );
        rtn =  res.data;
      }

    })
    .catch((err) => {
      console.log(err);
    });

  return rtn;
};




export const handlePurchaseItem = async (
  token: string,
  purchaseItem: IOrderItemProcess,
  quarantine:boolean,
): Promise<IOrderItem | null> => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
    params: {quarantine: quarantine}
  };

  await api
    .post("/receive-item", purchaseItem, config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        return res.data;
      }
    })
    .catch((err) => {
      console.log(err);
    });

  return null;
};
