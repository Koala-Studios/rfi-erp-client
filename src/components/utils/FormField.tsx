import React from "react";
import { FieldProps } from "formik";
import { TextField } from "@mui/material";

interface Props {
  placeholder: string;
  label: string;
  type: any;
  fields: any;
}

export const FormField: React.FC<Props> = ({
  placeholder,
  label,
  type,
  fields,
}) => {
  return (
    <TextField
      fullWidth
      type={type}
      placeholder={placeholder}
      label={label}
      variant="outlined"
      {...fields}
    />
  );
};
