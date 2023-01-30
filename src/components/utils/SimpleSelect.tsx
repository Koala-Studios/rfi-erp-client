import { MenuItem, TextField } from "@mui/material";
import React from "react";
import { OptionItem } from "../../logic/utils";

interface Props {
  label: string;
  options: OptionItem[];
  inputRef: any;
}

const SimpleSelect: React.FC<Props> = ({ options, inputRef, label }) => {
  return (
    <TextField
      inputRef={inputRef}
      //   onChange={(e) => setValue(e.target.value)}
      select // tell TextField to render select
      label={label}
      InputLabelProps={{ shrink: true }}
      fullWidth
      size="small"
      spellCheck="false"
    >
      {options.map((o) => (
        <MenuItem value={o.value}>{o.text}</MenuItem>
      ))}
    </TextField>
  );
};

export default SimpleSelect;
