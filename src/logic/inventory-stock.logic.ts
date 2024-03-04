import axios from "axios";
import { ObjectId } from "bson";
import { apiStatus, FilterElement, getQuery, IListOptions } from "./utils";
import { IInventory } from "./inventory.logic";

interface IStockExtension {
  extension_date: Date;
  passed: boolean;
}

interface IQATest {
  test_date: Date;
  passed: boolean;
}

export interface IInventoryStockGrouped {
  _id: { product_id: string; product_code: string };
  product_code: string;
  name: string;
  average_cost: number;
  sample: boolean;
  received_amount: number;
  remaining_amount: number;
  allocated_amount: number;
  quarantined_containers: number;
  items: [IInventoryStock];
}

export interface IInventoryStock {
  _id: string;
  product_id: string;
  product_code: string;
  name: string;
  unit_cost: number;
  container_size: number;
  sample: boolean;
  is_solid: boolean;
  is_open: boolean;
  received_amount: number;
  remaining_amount: number;
  allocated_amount: number;
  quarantined_containers: number;

  lot_number: string;

  supplier_code: string;
  supplier_id: ObjectId;
  supplier_sku: ObjectId;

  received_date: Date;
  expiry_date: Date;
  notes: string;
  extensions: [IStockExtension];
  qc_tests: [IQATest];
}

const api = axios.create({
  baseURL: "http://localhost:5000/inventory-stock",
});
export const listInventoryStock = async (
  q: URLSearchParams | undefined,
  filters: FilterElement[],
  grouped: boolean
): Promise<IListOptions | null> => {
  let query = getQuery(q, filters);
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: {
      query,
      grouped,
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

export const listInventoryContainers = async (
  q: URLSearchParams | undefined,
  filters: FilterElement[],
  id: string | undefined
): Promise<IListOptions | null> => {
  let query = getQuery(q, filters);

  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: {
      query,
      product_id: id,
    },
  };

  let list: IListOptions | null = null;

  await api
    .get("/list-containers", config)
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

export const listLocationContainers = async (
  location_id: string
): Promise<IInventoryStock[] | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: {
      location_id,
    },
  };

  let list: IListOptions | null = null;

  await api
    .get("/list-location-containers", config)
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

export const getStockItem = async (
  id: string
): Promise<IInventoryStock | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: {
      id: id,
    },
  };

  let inventory_stock_item: IInventoryStock | null = null;

  await api
    .get("/get", config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        inventory_stock_item = res.data;
      }
    })
    .catch((err) => {
      console.log(err);
    });

  return inventory_stock_item;
};

export const lookupInventoryStock = async (
  //TODO: Not finished
  search_value: string,
  product_id?: string
): Promise<IInventoryStock[] | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: {
      search_value,
      product_id,
    },
  };

  let list: IInventoryStock[] | null = null;

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

export const moveBulkContainers = async (
  container_ids: string[],
  location: { _id: string; code: string }
): Promise<boolean> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: {
      container_ids: container_ids,
    },
  };

  let result: boolean = false;

  await api
    .post("/move-bulk", location, config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        result = res.data.res;
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
  return result;
};
