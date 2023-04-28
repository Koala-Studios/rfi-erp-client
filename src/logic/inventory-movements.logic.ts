import axios from "axios";
import { ObjectId } from "bson";
import { apiStatus, FilterElement, getQuery, IListOptions } from "./utils";

const api = axios.create({
  baseURL: "http://localhost:5000/inventory-movement",
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
