import axios from "axios";
import {
  apiStatus,
  FilterElement,
  getQuery,
  IListOptions,
  paramsToObject,
} from "./utils";
import { IInventoryStock } from "./inventory-stock.logic";

export interface ICountItem {
  _id: string;
  product_id: string;
  product_code: string;
  name: string;
  lot_number: string;
  expiry_date: Date;
  container_id: string;
  container_size: number;
  container_amount: number;
  current_amount: number;
  proposed_amount: number;
}

export interface IStockCount {
  _id: string;
  count_code: string;
  created_date: string;
  approved_date: string;
  count_items: ICountItem[];
  notes: string;
  status: number;
}

const api = axios.create({
  baseURL: "http://localhost:5000/stock-counts",
});

export const listStockCounts = async (
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

export const getStockCount = async (
  id: string
): Promise<IStockCount | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: {
      id: id,
    },
  };

  let stockCount: IStockCount | null = null;

  await api
    .get("/get", config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        console.log(res);
        stockCount = res.data.res;
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

  return stockCount;
};

export const createStockCount = async (
  formData: IStockCount
): Promise<IStockCount | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
  };

  let rtn = null;

  await api
    .post("/create", formData, config)
    .then((res) => {
      console.log(res);
      if (res.status === apiStatus.CREATED) {
        rtn = res.data.res;
        console.log(res, "stock count res!");
        window.dispatchEvent(
          new CustomEvent("NotificationEvent", {
            detail: { text: res.data.message },
          })
        );
      }
    })
    .catch((err) => {
      console.log(err);
    });

  return rtn;
};
export const updateStockCount = async (
  formData: IStockCount
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

export const submitStockCount = async (
  formData: IStockCount
): Promise<IStockCount | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
  };
  let rtn = null;
  await api
    .post("/submit-for-approval", formData, config)
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

export const approveStockCount = async (
  formData: IStockCount
): Promise<IStockCount | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
  };

  let rtn = null;

  await api
    .post("/approve", formData, config)
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

export const disapproveStockCount = async (
  formData: IStockCount
): Promise<IStockCount | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
  };

  let rtn = null;

  await api
    .post("/disapprove", formData, config)
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

export const abandonStockCount = async (
  formData: IStockCount
): Promise<IStockCount | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
  };

  let rtn = null;

  await api
    .post("/abandon", formData, config)
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
