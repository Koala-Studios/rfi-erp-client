import { IUser } from "./user.logic";
import axios from "axios";
import { apiStatus, FilterElement, getQuery, IListOptions } from "./utils";
import { ICustomer } from "./customer.logic";

export interface IProject {
  _id: string;
  project_code: string;
  iteration: number;
  name: string;
  date_created?: Date;
  start_date: string;
  finish_date?: string;
  assigned_user?: IUser;
  status?: number;
  notes?: string;
  customer: ICustomer | null;
  project_items: IProjectItem[];
}

export interface IProjectItem {
  _id: string;
  flavor_name: string;
  // code: string;
  product_id: string;
  product_name: string;
  status: number;
  product_status: number;
  product_code: string;
  assigned_user: IUser;
  notes?:string;
  external_code?:string;
  regulatory_status?:[Number];
  dietary_status?:[Number];
}

const api = axios.create({
  baseURL: "http://localhost:5000/projects",
});

export const listProjects = async (
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

export const getProject = async (id: string): Promise<IProject | null> => {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    params: {
      id: id,
    },
  };

  let project: IProject | null = null;

  await api
    .get("/get", config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        project = res.data;
      }
    })
    .catch((err) => {
      console.log(err);
    });

  return project;
};

// export const createProject = async (
//   token: string,
//   formData: string
// ): Promise<IProject | null> => {
//   const config = {
//     headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
//   };

//   let project: IProject | null = null;

//   await api
//     .post("/create", formData, config)
//     .then((res) => {
//       console.log(res);
//       if (res.status === apiStatus.CREATED) {
//         project = res.data;
//       }
//     })
//     .catch((err) => {
//       console.log(err);
//     });

//   return project;
// };

export const createProject = async (
  formData: IProject
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
export const updateProject = async (formData: IProject): Promise<boolean> => {
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
