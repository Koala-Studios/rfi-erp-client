import { Autocomplete, Checkbox, Grid, Paper, TextField, Typography } from "@mui/material";
import { GridRenderCellParams } from "@mui/x-data-grid";
import { setegid } from "process";
import React from "react";
import { IFormulaItem } from "../../logic/formula.logic";
import { lookupInventory } from "../../logic/inventory.logic";
import { AuthContext } from "../navigation/AuthProvider";
import SpaIcon from '@mui/icons-material/Spa';

interface IFormulaDevRow extends IFormulaItem {
  id: number;
  last_cost: number | null;
  item_cost: number | null;
  last_amount: number | null;
}

interface Props {
  editMode: string | null;
  setEditMode: any;
  handleEditRow: any;
  rowParams: GridRenderCellParams<string>;
}

const GenericAutocomplete: React.FC<Props> = ({
  editMode,
  setEditMode,
  handleEditRow,
  rowParams,
}) => {
  const [invLookupCatalog, setInvLookupCatalog] = React.useState<any>(null);
  const auth = React.useContext(AuthContext);
  const [inputValue, setInputValue] = React.useState("");
  function filterChanges(string: string) {
    lookupInventory(auth.token, string, false).then((result) => {
      const newCatalog = result?.map((item, key) => {
        return {
          id: key,
          material_id: item._id,
          material_code: item.product_code,
          material_name: item.name,
          label: item.product_code + " |     " + item.name,
          cost: item.cost,
        };
      });
      setInvLookupCatalog(newCatalog);
    });
  }

  return (
    <Autocomplete
      // clearOnBlur={true}
      id="combo-box-demo"
      filterOptions={(x) => x}
      openOnFocus
      selectOnFocus
      freeSolo
      onBlur={() => {
        if (editMode === rowParams.row.id) {

          setEditMode(null);
        }
      }} //Have to test this more, it used to glitch out
      options={invLookupCatalog ? invLookupCatalog : []}
      renderOption={(props, option:any, { selected }) => (

        <li {...props}>
          <div style={{ minWidth:25, width:25 }}>
          <SpaIcon style={{maxWidth:20, color:"#67996c", display:option.cost < 20 ? 'none' : 'block' }}/>
          
          </div>
          {option.label}
        </li>
      )}
      PaperComponent={({ children }) => (
        <Paper
          variant="outlined"
          style={{
            background: "#e4e6ee",
            fontSize: "16px",
            maxWidth: "450px",
            minWidth: "450px",
            minHeight: "39px",
            marginLeft:"-3%"
          }}
        >
          {children}
        </Paper>
      )}
      sx={{ width: 340, height: "39px" }}
      // selectOnFocus
      // openOnFocus
      // disableClearable
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        if (newInputValue.length > 2) {
          filterChanges(newInputValue.toUpperCase());
        }
        if(editMode === rowParams.row.id) {
          setInputValue(newInputValue);
        }
      }}
      onChange={(event, value) => {
        //Works great if you use arrow keys and Enter key to select, otherwise it doesn't work :-()
        const value_obj = value as IFormulaDevRow;
        if (value_obj) {
          let newRow: IFormulaDevRow = {
            id: rowParams.row.id,
            material_id: value_obj.material_id,
            material_code: value_obj.material_code,
            material_name: value_obj.material_name,
            cost: value_obj.cost,
            amount: 0,
            last_amount: 0,
            item_cost: value_obj.cost,
            last_cost: 0,
            notes: "",
          };
          handleEditRow(newRow.id, newRow);
        } else {
          console.log("dud");
        }

        setEditMode(null);
      }}
      renderInput={(params) => (
        <div
          ref={params.InputProps.ref}
          style={{ width: "340px", height: "39px" }}
          onDoubleClick={() => {
            setInputValue("");
            setEditMode(rowParams.row.id);
          }}
        >
          <input
            autoFocus={true}
            type="text"
            style={{ marginLeft: "-3%", width: "340px", height: "39px", textTransform: "uppercase" }}
            hidden={editMode != rowParams.row.id}
            {...params.inputProps}
          />
          <div
            style={{
              minWidth: "340px",
              minHeight: "39px",
              paddingBottom: "10px",
              paddingTop: "10px",
            }}
            hidden={editMode === rowParams.row.id}
          >
            <Typography variant="subtitle2" style={{ fontSize: "15px" }}>
              {rowParams.row.material_name}
            </Typography>
          </div>
        </div>
      )}
    />
  );
};

export default GenericAutocomplete;
