import { MenuItem, Select } from "@mui/material";

interface Props {
    options: [{value: any, label: string}],
  }

const TableDropdown: React.FC<Props> = ({
options,
}) => {
    
  return (
    <Select
    //   value={value}
    //   onChange={handleChange}
      size="small"
      multiple
      sx={{
        height: 1,
        width: "100%",
      }}
    >
        {options.map((option) => {
            <MenuItem value={option.value}>{option.label}</MenuItem>
        })}
    </Select>
  );
}

export default TableDropdown;