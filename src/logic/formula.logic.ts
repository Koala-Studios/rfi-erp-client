import axios from "axios";
import { IProduct } from "./product.logic";
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
  _id?: string;
  product_code: string;
  product_id: string;
  version?: number;
  yield: number;
  base_hundred?: boolean;
  date_created?: Date;
  formula_items: IFormulaItem[];
}

const api = axios.create({
  baseURL: "http://localhost:5000/formula",
});

export const getFormula = async (
  id: string,
  version: string
): Promise<IFormula | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
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
        new CustomEvent("NotificationEvent", {
          detail: { text: res.data.message },
        })
      );
    })
    .catch((err) => {
      console.log(err);
    });

  return formula;
};

export const submitFormula = async (
  approved: boolean,
  formula: IFormula
): Promise<IProduct | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: {
      approved,
    },
  };
  // console.log(id, version, 'testing it all')
  let product: IProduct | null = null;

  await api
    .post("/submit", formula, config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        product = res.data.res;
      }
      // console.log('hello')
      window.dispatchEvent(
        new CustomEvent("NotificationEvent", {
          detail: { text: res.data.message },
        })
      );
    })
    .catch((err) => {
      console.log(err);
    });

  return product;
};
