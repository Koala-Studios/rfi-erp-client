import axios from "axios";
import { ObjectId } from "bson";
import { apiStatus, FilterElement, getQuery, IListOptions } from "./utils";

// export interface IProduct {
//   _id: string;
//   product_code: string;
//   name: string;
//   versions: number;
//   approved_version: number;
//   cost: number;
//   date_created?: string;
//   status: number;
// }

interface IRegulatoryContainer {
  fda_status?: number;
  cpl_hazard?: string;
  fema_number?: number;
  ttb_status?: string;
  eu_status?: number;
  organic?: boolean;
  kosher?: boolean;
}

interface IProductCustomers {
  customer_id: ObjectId;
  name: string;
}
interface IProductContainer {
  on_hand: number;
  in_transit: number;
  on_order: number;
  allocated: number;
  on_hold: number;
  quarantined: number;
}

export interface IProduct {
  _id: string;
  name: string;
  description: string;
  rating: number | null;
  product_code: string;
  date_created: string;
  is_raw_mat?: boolean;
  for_sale?: boolean;
  cost: number;
  stock?: IProductContainer;
  customers: IProductCustomers[];
  regulatory: IRegulatoryContainer;
  aliases:string;
  versions: number;
  status: number;
  approved_version: number;
  rec_dose_rate?: number;
  product_type: { name: string; _id: string } | null;
}

const api = axios.create({
  baseURL: "http://localhost:5000/products",
});

export const listProducts = async (
  q: URLSearchParams | undefined,
  filters: FilterElement[],
  approved?: boolean,
): Promise<IListOptions | null> => {
  
  let query = getQuery(q, filters);
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: {
      approved,
      query
    },
  };

  let list: IListOptions | null = null;

  await api
    .get("/list", config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        list = res.data.res;
        console.log(res, 'asdsad')
      }
    })
    .catch((err) => {
      console.log(err);
    });

  return list;
};



export const lookupProduct = async (
  search_value: string,
  for_sale: boolean | undefined,
  approved: boolean | undefined
): Promise<IProduct[] | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: {
      search_value: search_value,
      for_sale: for_sale,
      approved: approved
    },
  };

  let list: IProduct[] | null = null;
  await api
    .get("/lookup", config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        console.log(res, 'test')
        list = res.data.res;
      }
    })
    .catch((err) => {
      console.log(err);
    });
  return list;
};

export const lookupProducts = async (code_list:string[]):Promise<IProduct[] | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: {
      code_list: code_list
    },
  };

  let products: IProduct[] | null = null;

  await api
    .get("/lookup-list", config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        products = res.data;
      }
    })
    .catch((err) => {
      console.log(err);
    });

  return products;
}

export const getProduct = async (id: string): Promise<IProduct | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: {
      id: id,
    },
  };

  let product: IProduct | null = null;

  await api
    .get("/get", config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        product = res.data;
      }
    })
    .catch((err) => {
      console.log(err);
    });

  return product;
};

export const createProduct = async (
  formData: IProduct
): Promise<IProduct  | null> => {
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
export const updateProduct = async (formData: IProduct): Promise<boolean> => {
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
