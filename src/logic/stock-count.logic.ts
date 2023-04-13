import axios from "axios";
import {
  apiStatus,
  FilterElement,
  getQuery,
  IListOptions,
  paramsToObject,
} from "./utils";

export interface ICountItem {
    _id: string;
    product_id: string;
    product_code: string;
    product_name: string;
    amount: number;
    amount_proposed: number;
}

export interface IStockCount {
    _id: string;
    order_code:string;
    date_proposed: string;
    count_items: ICountItem[];
    notes:string;
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
    token: string,
    id: string
  ): Promise<IStockCount | null> => {
    const config = {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        id: id,
      },
    };
  
    let stockCount: IStockCount | null = null;
  
    await api
      .get("/get", config)
      .then((res) => {
        if (res.status === apiStatus.OK) {
          stockCount = res.data.res;
        }
        window.dispatchEvent(
          new CustomEvent("NotificationEvent", { detail: { text: res.data.message } })
        );
      })
      .catch((err) => {
        console.log(err);
      });
  
    return stockCount;
  };
  
  
  
  export const createStockCount = async (
    token: string,
    formData: IStockCount
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
  export const updateStockCount = async (
    token: string,
    formData: IStockCount
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
  
  export const confirmStockCount = async (
    token: string,
    stockCount: IStockCount,
    stockCount_id: string,
  ): Promise<IStockCount | null> => {
    const config = {
      headers: { Authorization: `Bearer ${token}` },
      // params: {stockCount_id: stockCount_id}
    };
    let rtn = null;
    await api
      .post("/confirm-stock-count", stockCount, config)
      .then((res) => {
        if (res.status === apiStatus.OK) {
          window.dispatchEvent(
            new CustomEvent("NotificationEvent", { detail: { text: res.data.message } })
          );
          rtn = res.data.res;
        }
  
      })
      .catch((err) => {
        console.log(err);
      });
  
    return rtn;
  };
  
  export const markStockCountReceived = async (
    token: string,
    stockCount_id: string,
  ): Promise<IStockCount | null> => {
    const config = {
      headers: { Authorization: `Bearer ${token}` },
      params: { stockCount_id: stockCount_id }
    };
  
  
    let rtn = null;
  
    await api
      .post("/mark-received", stockCount_id, config)
      .then((res) => {
        if (res.status === apiStatus.OK) {
          window.dispatchEvent(
            new CustomEvent("NotificationEvent", { detail: { text: res.data.message } })
          );
          rtn = res.data.res;
        }
  
      })
      .catch((err) => {
        console.log(err);
      });
  
    return rtn;
  };
  
  export const markStockCountCancelled = async (
    token: string,
    stockCount_id: string,
  ): Promise<IStockCount | null> => {
    const config = {
      headers: { Authorization: `Bearer ${token}` },
      params: { stockCount_id: stockCount_id }
    };
  
    let rtn = null;
  
    await api
      .post("/mark-cancelled", stockCount_id, config)
      .then((res) => {
        if (res.status === apiStatus.OK) {
          window.dispatchEvent(
            new CustomEvent("NotificationEvent", { detail: { text: res.data.message } })
          );
          rtn = res.data.res;
        }
  
      })
      .catch((err) => {
        console.log(err);
      });
  
    return rtn;
  };
