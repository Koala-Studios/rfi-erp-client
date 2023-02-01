import axios from "axios";
import { apiStatus, IListOptions } from "./utils";

export interface ISupplier {
  _id: string;
  name: string;
  code: string;
  email:string;
  contact_name: string;
  address_one?: string;
  address_two?: string;
  lead_time?:string;
  phone?:string;
  createdAt?:string;
}

const api = axios.create({
  baseURL: "http://localhost:5000/suppliers",
});


export const lookupSupplier = async (
  //TODO: Not finished
  token: string,
  search_value: string
): Promise<ISupplier[] | null> => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      search_value,
    },
  };

  let list: ISupplier[] | null = null;

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

export const listSuppliers = async (
  token: string,
  count: number,
  page: number
): Promise<IListOptions | null> => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      count,
      page,
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

export const getSupplier = async (
  token: string,
  id: string
): Promise<ISupplier | null> => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      id: id,
    },
  };

  let supplier: ISupplier | null = null;

  await api
    .get("/get", config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        supplier = res.data;
      }
    })
    .catch((err) => {
      console.log(err);
    });

  return supplier;
};

export const createSupplier = async (
  token: string,
  formData: ISupplier
): Promise<string | null> => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
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
export const updateSupplier = async (
  token: string,
  formData: ISupplier
): Promise<boolean> => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
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