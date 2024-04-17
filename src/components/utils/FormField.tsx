import React from "react";
import { TextField } from "@mui/material";

interface Props {
  placeholder?: string;
  label: string;
  name: string;
  type: any;
  fields?: any;
  ref: any;
  required?: boolean;
  handleChange: any;
}

export const FormField: React.FC<Props> = React.forwardRef(
  ({ placeholder, label, type, fields, required, name, handleChange }, ref) => (
    <TextField
      inputRef={ref}
      required={required}
      name={name}
      fullWidth
      type={type}
      placeholder={placeholder}
      onChange={handleChange}
      label={label}
      variant="filled"
      size="small"
      {...fields}
    />
  )
);
