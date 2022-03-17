import axios from "axios";
import apiStatus from "./apiStatus";

export interface IFormula {
  _id: string;
  product_code: string;
  version: number;
  date_created: Date;
  formula_items: [
    {
      material_code: string;
      amount: number;
      notes: string;
    }
  ];
}

const api = axios.create({
  baseURL: "http://localhost:5000/formula",
});

export const getFormula = async (
  token: string,
  product_id: number,
  version: number
): Promise<IFormula | null> => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      product_id: product_id,
      version: version,
    },
  };

  let formula: IFormula | null = null;

  await api
    .get("/list", config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        formula = res.data;
      }
    })
    .catch((err) => {
      console.log(err);
    });

  return formula;
};
