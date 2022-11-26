import React from "react";
import { TextField } from "@mui/material";

interface Props {
  placeholder?: string;
  label: string;
  type: any;
  fields?: any;
  ref: any;
  required?: boolean;
}

export const FormField: React.FC<Props> = React.forwardRef(
  ({ placeholder, label, type, fields, required }, ref) => (
    <TextField
      inputRef={ref}
      required={required}
      fullWidth
      type={type}
      placeholder={placeholder}
      label={label}
      variant="filled"
      size="small"
      {...fields}
    />
  )
);
