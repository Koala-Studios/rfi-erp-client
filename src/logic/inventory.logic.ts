import axios from "axios";
import { apiStatus, FilterElement, getQuery, IListOptions } from "./utils";

interface IProductTypes {
  product_type_id: string;
  name: string;
  for_sale: boolean;
  is_raw: boolean;
}
interface IStockSummary {
  on_hold: number;
  on_hand: number;
  on_order: number;
  quarantined: number;
  allocated: number;
  average_price: number;
  reorder_amount: number;
}
interface IRegulatoryContainer {
  fda_status?: number;
  cpl_hazard?: string;
  fema_number?: number;
  ttb_status?: string;
  eu_status?: number;
  organic?: boolean;
  kosher?: boolean;
}
export interface IInventory {
  _id: string;
  product_code: string;
  name: string;
  cost: number;
  quantity: number;
  date_created: Date;
  cas_number: string;
  reorder_amount: number;
  stock: IStockSummary;
  regulatory: IRegulatoryContainer;
  product_type: { name: string; _id: string } | null;
}

const api = axios.create({
  baseURL: "http://localhost:5000/inventory",
});
export const listInventory = async (
  token: string,
  count: number,
  page: number,
  q: URLSearchParams | undefined,
  filters: FilterElement[]
): Promise<IListOptions | null> => {
  let query = getQuery(q, filters);

  const config = {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      count,
      page,
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

export const getProduct = async (
  token: string,
  id: string
): Promise<IInventory | null> => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      id: id,
    },
  };

  let inventory_item: IInventory | null = null;

  await api
    .get("/get", config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        inventory_item = res.data;
      }
    })
    .catch((err) => {
      console.log(err);
    });

  return inventory_item;
};

export const lookupInventory = async (
  //TODO: Not finished
  token: string,
  search_value: string,
  for_sale: boolean,
  approved?:boolean,
): Promise<IInventory[] | null> => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      search_value,
      for_sale,
      approved
    },
  };

  let list: IInventory[] | null = null;

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

export const lookupProductTypes = async (
  //TODO: Not finished
  token: string,
  search_value: string,
  for_sale: boolean
): Promise<IProductTypes | null> => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      search_value,
      for_sale,
    },
  };

  let list: IProductTypes[] | null = null;

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
