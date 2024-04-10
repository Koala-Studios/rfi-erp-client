import axios from "axios";
import { apiStatus, FilterElement, getQuery, IListOptions } from "./utils";
import config from "../config/config";

export const movementTypes = {
  ON_HOLD: "on_hold",
  ON_HAND: "on_hand",
  ORDERED: "ordered",
  IN_TRANSIT: "in_transit",
  QUARANTINED: "quarantined",
  ALLOCATED: "allocated",
  MOVED: "moved",
};

export interface IMovement {
  product_id: string;
  product_code: string;
  name: string;
  module_source: string;
  movement_source_type: string;
  movement_target_type: string;
  amount: number;
  source_lot_number?: string;
  lot_number?: string;
  source_location?: { _id: string; code: string };
  target_location: { _id: string; code: string };
  movement_date: Date;
}

const api = axios.create({
  baseURL: config.API.BASE_URL + config.API.PORT + "/inventory-movement",
});
export const listInventoryMovements = async (
  q: URLSearchParams | undefined,
  filters: FilterElement[],
  product_id: string | undefined
): Promise<IListOptions | null> => {
  let query = getQuery(q, filters);

  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: {
      query,
      product_id: product_id,
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
