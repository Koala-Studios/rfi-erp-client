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

export interface IInventorySupplierItem {
  _id: string;
  name: string;
}
export interface IInventory {
  _id: string;
  product_code: string;
  name: string;
  description:string;
  cost: number;
  rating: number | null;
  for_sale: boolean;
  is_raw: boolean;
  quantity: number;
  date_created: string;
  cas_number: string;
  reorder_amount: number;
  aliases:string;
  stock: IStockSummary;
  suppliers: IInventorySupplierItem[];
  regulatory: IRegulatoryContainer;
  product_type: { name: string; _id: string } | null;
}

const api = axios.create({
  baseURL: "http://localhost:5000/inventory",
});
export const listInventory = async (
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



export const createInventory = async (
  formData: IInventory
): Promise<IInventory  | null> => {
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
export const updateInventory = async (formData: IInventory): Promise<boolean> => {
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

export const getInventory = async (id: string): Promise<IInventory | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
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
  search_value: string,
  for_sale: boolean | undefined,
  is_raw: boolean | undefined,
  approved?: boolean | undefined
): Promise<IInventory[] | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: {
      search_value,
      for_sale,
      is_raw,
      approved,
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
  search_value: string,
  for_sale: boolean
): Promise<IProductTypes | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
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
