import axios from "axios";
import { apiStatus, FilterElement, getQuery, IListOptions } from "./utils";

export interface IQualityControl {
  _id: string;
  product_id: string;
  product_code: string;
  product_name: string;
  lot_number?: string;
  external_product: boolean;
  request_source: String;
  request_type: string;
  created_date: string;
  completed_date: string;
  test_id: string;
  notes: string;
  status: number;
}

export const orderStatus = {
  PENDING: 0,
  FAILED: 1,
  APPROVED: 2,
};

const api = axios.create({
  baseURL: "http://localhost:5000/qc",
});

export const getQualityControl = async (
  id: string
): Promise<IQualityControl | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: {
      qc_id: id,
    },
  };

  let qc: IQualityControl | null = null;
  await api
    .get("/get", config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        qc = res.data.res;
        console.log(res);
      }
    })
    .catch((err) => {
      console.log(err);
    });
  return qc;
};

export const listQualityControl = async (
  q: URLSearchParams | undefined,
  filters: FilterElement[]
): Promise<IListOptions | null> => {
  let query = getQuery(q, filters);

  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: {
      query,
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

export const lookupQualityControl = async (
  search_value: string
): Promise<IQualityControl[] | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: {
      search_value,
    },
  };

  let list: IQualityControl[] | null = null;

  await api
    .get("/lookup", config)
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

export const createQualityControl = async (
  formData: IQualityControl
): Promise<string | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
  };

  let rtn = null;

  await api
    .post("/create", formData, config)
    .then((res) => {
      console.log(res);
      if (res.status === apiStatus.CREATED) {
        console.log(res.data);
        rtn = res.data;
      }
    })
    .catch((err) => {
      console.log(err);
    });

  return rtn;
};
export const updateQualityControl = async (
  formData: IQualityControl
): Promise<boolean> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
  };

  let rtn = false;

  await api
    .post("/update", formData, config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        rtn = true;
      }
    })
    .catch((err) => {
      console.log(err);
    });

  return rtn;
};
