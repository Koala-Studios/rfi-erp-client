import axios from "axios";
import { apiStatus, IListOptions } from "./utils";

export interface IFormulaItem {
  material_name: string;
  material_code: string;
  material_id: string; //inventory
  amount: number;
  notes: string;
  cost: number;
}

export interface IFormula {
  _id: string;
  product_code: string;
  product_id: string;
  version: number;
  date_created: Date;
  formula_items: IFormulaItem[];
}

const api = axios.create({
  baseURL: "http://localhost:5000/formula",
});

export const getFormula = async (
  token: string,
  id: string,
  version: string
): Promise<IFormula | null> => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      product_id: id,
      version: version,
    },
  };
  // console.log(id, version, 'testing it all')
  let formula: IFormula | null = null;

  await api
    .get("/get", config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        formula = res.data.res;
      }
      // console.log('hello')
      window.dispatchEvent(
        new CustomEvent("NotificationEvent", { detail: res.data.message })
      );
    })
    .catch((err) => {
      console.log(err);
    });

  return formula;
};
