import axios from "axios";
import { ObjectId } from "bson";
import { apiStatus, FilterElement, getQuery, IListOptions } from "./utils";

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
  received_amount: number;
  used_amount: number;
  allocated_amount: number;
  quarantined_containers: number;
  items: [IInventoryStock];
}

export interface IInventoryStock {
  _id: ObjectId;
  product_id: string;
  product_code: string;
  name: string;
  unit_cost: number;
  container_size: number;
  received_amount: number;
  used_amount: number;
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
  token: string,
  search_value: string,
  for_sale: boolean
): Promise<IInventoryStock[] | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: {
      search_value,
      for_sale,
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
