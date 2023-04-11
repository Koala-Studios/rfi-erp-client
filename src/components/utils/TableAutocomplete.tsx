import { Autocomplete, Paper, TextField, Typography } from "@mui/material";
import { GridRenderCellParams } from "@mui/x-data-grid";
import React from "react";
import { lookup } from "../../logic/autocomplete.logic";
import { AuthContext } from "../navigation/AuthProvider";

interface Props {
  dbOption:
  | "customer"
  | "inventory"// all products and materials
  | "material" // not for sale
  | "raw-mat" //is raw, not for sale
  | "non-raw-mat" //is not raw, not for sale
  | "product" //for sale
  | "approved-product" //approved and for sale
  | "approved-product-all" //for sale and not for sale, just approved that matters
  | "user"
  | "supplier"
  | "product-type"
  | "product-type-mat",
  handleEditRow: (id: string, newItem: any) => void;
  readOnly?:boolean,
  rowParams: GridRenderCellParams<string>;
  initialValue: string;
  letterMin: number;
  viewOnly?: boolean;
  getOptionLabel: (option: any) => any;
}

const TableAutocomplete: React.FC<Props> = ({
  handleEditRow,
  rowParams,
  initialValue,
  letterMin,
  dbOption,
  getOptionLabel,
  readOnly = false
}) => {
  const [editMode, setEditMode] = React.useState(false);
  const [optionList, setOptionList] = React.useState<any>([]);
  const auth = React.useContext(AuthContext);

  const handleInputChange = async (
    event: React.SyntheticEvent<Element, Event>,
    value: string
  ) => {
    lookup(value.toUpperCase(), dbOption, letterMin).then((result) => {
      setOptionList(result);
    });
  };

  if (editMode) {
    return (
      <Autocomplete
        clearOnBlur={true}
        filterOptions={(x) => x}
        openOnFocus
        selectOnFocus
        readOnly={readOnly}
        options={optionList}
        getOptionLabel={getOptionLabel}
        PaperComponent={({ children }) => (
          <Paper
            variant="outlined"
            style={{
              background: "#e4e6ee",
              fontSize: "16px",
              maxWidth: "450px",
              minWidth: "450px",
            }}
          >
            {children}
          </Paper>
        )}
        sx={{ width: 340, height: "39px" }}
        onInputChange={handleInputChange}
        onBlur={() => setEditMode(false)}
        onChange={(event, value) => {
          handleEditRow(rowParams.row._id, value);
          setEditMode(false);
        }}
        renderInput={(params) => {
          // params.inputProps.style = { textTransform: "capitalize" }; //textTransform uppercase doesn't work on style
          return (
            <TextField
              variant="outlined"
              autoFocus
              style={{
                marginLeft: "-5%",
                minWidth: "110%",
                minHeight: "39px",
                maxHeight: "39px",
              }}
              placeholder={initialValue}
              {...params}
            />
          );
        }}
      />
    );
  } else {
    return (
      <div
        style={{
          minWidth: "340px",
          minHeight: "39px",
          paddingBottom: "10px",
          paddingTop: "10px",
        }}
        onDoubleClick={() => setEditMode(true)}
      >
        <Typography variant="subtitle2" style={{ fontSize: "15px" }}>
          {initialValue}
        </Typography>
      </div>
    );
  }
};

export default TableAutocomplete;

//onchange old stuff

//Works great if you use arrow keys and Enter key to select, otherwise it doesn't work :-()
// const valueObj = value as IFormulaDevRow;
// if (value_obj) {
//   let newRow: IFormulaDevRow = {
//     id: rowParams.row._id,
//     material_id: value_obj.material_id,
//     material_code: value_obj.material_code,
//     material_name: value_obj.material_name,
//     cost: value_obj.cost,
//     amount: 0,
//     last_amount: 0,
//     item_cost: value_obj.cost,
//     last_cost: 0,
//     notes: "",
//   };

// } else {
//   console.log("dud");
// }

// function filterChanges(string: string) {
//   lookupInventory(string, false).then((result) => {
//     const newCatalog = result?.map((item, key) => {
//       return {
//         id: key,
//         material_id: item._id,
//         material_code: item.product_code,
//         material_name: item.name,
//         label: item.product_code + " |     " + item.name,
//         cost: item.cost,
//       };
//     });
//     setOptionList(newCatalog);
//   });
// }
