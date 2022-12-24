import { Autocomplete, Paper, TextField, Typography } from "@mui/material";
import { GridRenderCellParams } from "@mui/x-data-grid";
import React from "react";
import { IFormulaItem } from "../../logic/formula.logic";
import { lookupInventory } from "../../logic/inventory.logic";
import { AuthContext } from "../navigation/AuthProvider";

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
      clearOnBlur={true}
      id="combo-box-demo"
      filterOptions={(x) => x}
      options={invLookupCatalog ? invLookupCatalog : []}
      PaperComponent={({ children }) => (
        <Paper variant="outlined" style={{ background: "#eeeeee" }}>
          {children}
        </Paper>
      )}
      sx={{ width: 320 }}
      // selectOnFocus
      // openOnFocus
      // disableClearable
      onInputChange={(event, newInputValue) => {
        if (newInputValue.length > 2) {
          filterChanges(newInputValue.toUpperCase());
        }
      }}
      onChange={(event, value) => {
        //Works great if you use arrow keys and Enter key to select, otherwise it doesn't work :-()
        const value_obj = value as IFormulaDevRow;
        console.log(event, value);
        if (value_obj) {
          let newRow: IFormulaDevRow = {
            id: rowParams.row.id,
            material_id: value_obj.material_id,
            material_code: value_obj.material_code,
            material_name: value_obj.material_name,
            cost: value_obj.cost,
            amount: 3,
            last_amount: null,
            item_cost: value_obj.cost,
            last_cost: 0,
            notes: "",
          };
          handleEditRow(newRow);
          rowParams.value = value_obj.material_name;
        } else {
          console.log("dud");
        }

        setEditMode(null);
      }}
      renderInput={(params) => {
        if (editMode === rowParams.row.id) {
          return (
            <TextField
              variant="filled"
              autoFocus
              // onChange={(value) => {

              //   setEditMode(false);
              // }}
              placeholder={rowParams.row.material_name}
              {...params}
            />
          );
        } else {
          // <Typography></Typography>
          return (
            <div
              style={{ minWidth: "100%", minHeight: "100%" }}
              onDoubleClick={() => setEditMode(rowParams.row.id)}
            >
              <Typography variant="subtitle2">
                {rowParams.row.material_name}
              </Typography>
            </div>
          );
        }
      }}
    />
  );
};

export default GenericAutocomplete;
