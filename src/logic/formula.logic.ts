import axios from "axios";
import { IProduct } from "./product.logic";
import { apiStatus } from "./utils";

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
  yield: number;
  rec_dose_rate: number;
  date_created: Date;
  base: number;
  formula_items: IFormulaItem[];
  approved: boolean;
}

const api = axios.create({
  baseURL: "http://localhost:5000/formula",
});

export const getFormula = async (
  id: string,
  version?: number | null
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
  _approved: boolean,
  _formula: IFormula,
  _description: string
): Promise<[IProduct, IFormula] | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: {
      approved: _approved,
      description: _description,
    },
  };
  // console.log(id, version, 'testing it all')
  let product: IProduct | null = null;

  console.log(_formula, config, "test");

  await api
    .post("/submit-formula", _formula, config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        product = res.data.res;
        console.log(product, res, "test");
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

export const disapproveFormula = async (
  _product: IProduct
): Promise<IProduct | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
  };
  // console.log(id, version, 'testing it all')
  let product: IProduct | null = null;

  await api
    .post("/disapprove-formula", _product, config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        product = res.data.res;
        console.log(product, res, "test");
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

export const approveFormula = async (
  _product: IProduct
): Promise<IProduct | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
  };
  let product: IProduct | null = null;

  await api
    .post("/approve-formula", _product, config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        product = res.data.res;
        console.log(product, res, "test");
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
