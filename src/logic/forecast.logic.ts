import axios from "axios";
import { apiStatus, IListOptions } from "./utils";

export interface IProductLine {
  product_id: string;
  product_code: string;
  name: string;
  amount: string;
}
export interface IForecast {
  product_code: string;
  amount: number;
}

const api = axios.create({
  baseURL: "http://localhost:5000/forecast",
});

export const calculateForecast = async (
  token: string,
  productLines: IForecast[]
): Promise<IForecast[]> => {
  const data = {
    products: productLines,
  };

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  let forecastResult: IForecast[] = [];

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
