import axios from "axios";
import { apiStatus, IListOptions } from "./utils";

export interface IProduct {
  _id: string;
  product_code: string;
  name: string;
  versions: number;
  approved_version: number;
  cost: number;
  date_created: Date;
  status: number;
}


interface IRegulatoryContainer {
  fda_status?:number;
  cpl_hazard?:string;
  fema_number?:number;
  ttb_status?:string;
  eu_status?:number;
  organic?:boolean;
  kosher?:boolean;
}

interface IProductContainer {
  batch_code: string;
  on_hand: number;
  in_transit: number;
  on_order: number;
  allocated: number;
  on_hold: number;
  quarantined: number;
}

export interface IProduct{
  name:string;
  description:string;
  rating:number;
  product_code: string;
  is_raw_mat?: boolean,
  cost: number;
  stock?: IProductContainer;
  customers: [string];
  regulatory:IRegulatoryContainer;
  versions: number;
  status: number;
  approved_version: number;
  rec_dose_rate?:number;
}


const api = axios.create({
  baseURL: "http://localhost:5000/products",
});



export const listProducts = async (
  token: string,
  count: number,
  page: number,
  approved?: boolean
): Promise<IListOptions | null> => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      count,
      page,
      approved
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
): Promise<IProduct | null> => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
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
