import axios from "axios";
import { apiStatus } from "./utils";
import config from "../config/config";

export interface IProductLine {
  _id: string;
  product_id: string;
  product_code: string;
  product_name: string;
  amount: number;
}
export interface IForecast {
  product_id: string;
  product_code: string;
  product_name: string;
  amount: number;
}

export interface IForecastResults {
  product_id: string;
  product_code: string;
  product_name: string;
  required_amount: number;
  available_amount: number;
  ordered_amount: number;
  on_hand_amount: number;
  in_transit_amount: number;
  reorder_amount: number;
}
const api = axios.create({
  baseURL: config.API.BASE_URL + config.API.PORT + "/forecast",
});

export const calculateForecast = async (
  products: IForecast[],
  force_recursion: boolean
): Promise<IForecastResults[]> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: {
      force_recursion,
    },
  };

  let forecastResult: IForecastResults[] = [];

  await api
    .post("/calculate", products, config)
    .then((res) => {
      // console.log(res);
      if (res.status === apiStatus.OK) {
        forecastResult = res.data;
      }
    })
    .catch((err) => {
      console.log(err);
    });

  return forecastResult;
};
