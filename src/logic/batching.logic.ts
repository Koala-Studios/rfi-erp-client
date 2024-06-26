import axios from "axios";
import { apiStatus, FilterElement, getQuery, IListOptions } from "./utils";
import config from "../config/config";

export const batchingStatus = {
  DRAFT: 1,
  SCHEDULED: 2,
  IN_PROGRESS: 3,
  FINISHED: 4, //TODO: update db status of 2 to 3
  ABANDONED: 5,
  CANCELLED: 6,
};

export interface IBatching {
  _id: string;
  product_id: string | null;
  product_code: string;
  name: string;
  source_id: string;
  source_type: string;
  quantity: number;
  date_created: string;
  date_needed: string;
  ingredients: IBatchingIngredient[];
  batch_code: string;
  status: number;
  notes: string;
  has_enough?: boolean;
}

export interface IBatchingContainer {
  _id: string;
  product_id: string;
  container_id: string;
  lot_number: string;
  confirm_lot_number: string;
  // available_amount: number; //TODO: maybe live update somehow? we have sockets setup right?
  used_amount: number;
}

export interface IBatchingIngredient {
  sub_rows?: any;
  _id: string;
  product_id: string;
  product_code: string;
  product_name: string;
  required_amount: number;
  used_containers: IBatchingContainer[];
  used_amount: number;
  total_used_amount: number;
  avoid_recur: boolean;
  has_enough?: boolean;
}

const api = axios.create({
  baseURL: config.API.BASE_URL + config.API.PORT + "/batching",
});

export const listBatching = async (
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

export const getBatching = async (
  token: string,
  id: string
): Promise<IBatching | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: {
      id: id,
    },
  };

  let batching: IBatching | null = null;

  await api
    .get("/get", config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        console.log(res);
        batching = res.data.res;
      }
      window.dispatchEvent(
        new CustomEvent("NotificationEvent", {
          detail: { text: res.data.message },
        })
      );
    })
    .catch((err) => {
      console.log(err);
    });

  return batching;
};

export const updateBatchingOrder = async (
  formData: IBatching
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

export const createBatching = async (
  token: string,
  formData: IBatching
): Promise<IBatching | null> => {
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
        rtn = res.data.res;
      }
    })
    .catch((err) => {
      console.log(err);
    });

  return rtn;
};

export const confirmBatching = async (
  token: string,
  batching: IBatching
): Promise<IBatching | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
  };
  let rtn = null;
  await api
    .post("/confirm", batching, config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        window.dispatchEvent(
          new CustomEvent("NotificationEvent", {
            detail: { text: res.data.message },
          })
        );
        rtn = res.data.res;
      }
    })
    .catch((err) => {
      console.log(err);
    });
  return rtn;
};

export const updateBatching = async (
  token: string,
  formData: IBatching
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

export const finishBatching = async (
  batching_id: string
): Promise<IBatching | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: { batching_id: batching_id },
  };

  let rtn = null;

  await api
    .post("/finish-batching", batching_id, config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        window.dispatchEvent(
          new CustomEvent("NotificationEvent", {
            detail: { text: res.data.message },
          })
        );
        rtn = res.data.res;
      }
    })
    .catch((err) => {
      console.log(err);
    });

  return rtn;
};

export const markBatchingAbandoned = async (
  token: string,
  batching_id: string
): Promise<IBatching | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: { batching_id: batching_id },
  };

  let rtn = null;

  await api
    .post("/mark-abandoned", batching_id, config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        window.dispatchEvent(
          new CustomEvent("NotificationEvent", {
            detail: { text: res.data.message },
          })
        );
        rtn = res.data.res;
      }
    })
    .catch((err) => {
      console.log(err);
    });

  return rtn;
};

export const markBatchingCancelled = async (
  token: string,
  batching_id: string
): Promise<IBatching | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: { batching_id: batching_id },
  };

  let rtn = null;

  await api
    .post("/mark-cancelled", batching_id, config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        window.dispatchEvent(
          new CustomEvent("NotificationEvent", {
            detail: { text: res.data.message },
          })
        );
        rtn = res.data.res;
      }
    })
    .catch((err) => {
      console.log(err);
    });

  return rtn;
};

export const generateBatchingBOM = async (
  token: string,
  batching_id: string
): Promise<IBatching | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: { batching_id: batching_id },
  };

  let rtn = null;

  await api
    .post("/generate-bom", batching_id, config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        window.dispatchEvent(
          new CustomEvent("NotificationEvent", {
            detail: { text: res.data.message },
          })
        );
        // console.log(res.data, 'BATCH GENERATED BOM')
        rtn = res.data.res;
      }
    })
    .catch((err) => {
      console.log(err);
    });

  return rtn;
};
