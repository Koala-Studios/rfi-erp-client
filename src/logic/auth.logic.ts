import axios from "axios";
import { apiStatus } from "./utils";

const api = axios.create({
  baseURL: "http://localhost:5000/auth",
});

export interface ISignIn {
  username: string;
  password: string;
}

export const signIn = async (data: ISignIn, callback: any) => {
  if (data.username === "" || data.password === "") return false;

  let success = false;

  const config: ISignIn = {
    username: data.username,
    password: data.password,
  };

  await api
    .post("/login", config)
    .then((res) => {
      if (res.status === apiStatus.OK) {
        success = true;

        callback(res.data);
        localStorage.setItem("auth_token", res.data.token);
      }
    })
    .catch((err) => {
      console.log(err);
    });
  return success;
};

interface ISignUp {
  username: string;
  email: string;
  password: string;
}

export const signUp = async () => {
  let success = false;

  const config = {
    username: "test",
    email: "test@gmail.com",
    password: "test1",
  };
  await api
    .post("/newuser", config)
    .then((res) => {
      if (res.status === apiStatus.CREATED) {
        success = true;
      }
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
  return success;
};
