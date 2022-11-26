import { IUser } from "./user.logic";
import axios from "axios";
import apiStatus from "./apiStatus";

export interface IProject {
  _id: string;
  project_code: string;
  name: string;
  date_created: Date;
  start_date: Date;
  finish_date: Date;
  assigned_user: IUser;
  status: number;
  notes: string;
}

export interface IProjectItem {
  name: string;
  code: string;
  status: string;
  product_id: string;
  product_code: string;
}

const api = axios.create({
  baseURL: "http://localhost:5000/projects",
});

export const listProjects = async (
  token: string,
  count: number,
  page: number
): Promise<IProject[]> => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      count,
      page,
    },
  };

  let batches: IProject[] = [];

  await api
    .get("/list", config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        batches = res.data;
      }
    })
    .catch((err) => {
      console.log(err);
    });

  return batches;
};

export const getProject = async (
  token: string,
  id: string
): Promise<IProject | null> => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
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

export const createProject = async (
  token: string,
  formData: string
): Promise<IProject | null> => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  let project: IProject | null = null;

  await api
    .post("/create", formData, config)
    .then((res) => {
      console.log(res);
      if (res.status === apiStatus.CREATED) {
        project = res.data;
      }
    })
    .catch((err) => {
      console.log(err);
    });

  return project;
};
