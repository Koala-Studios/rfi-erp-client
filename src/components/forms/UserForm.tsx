import React from "react";
import { IUser } from "../../logic/user.logic";

interface Props {
  user: IUser;
}

export const UserForm: React.FC<Props> = ({ user }) => {
  return <div>UserForm</div>;
};
