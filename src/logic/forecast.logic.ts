import axios from "axios";
import { apiStatus, IListOptions } from "./utils";

export interface IProductLine {
  _id:string;
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
  product_id:string;
  product_code: string;
  product_name:string;
  required_amount: number;
  available_amount: number;
  on_order_amount: number;
  on_hand_amount: number;
  in_transit_amount: number;
  reorder_amount: number;
}
const api = axios.create({
  baseURL: "http://localhost:5000/forecast",
});

export const calculateForecast = async (
  token: string,
  productLines: IForecast[]
): Promise<IForecastResults[]> => {
  const data = {
    products: productLines,
  };

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  let forecastResult: IForecastResults[] = [];

  await api
    .post("/calculate", data, config)
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
