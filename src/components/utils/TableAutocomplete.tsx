import { Autocomplete, Paper, TextField, Typography } from "@mui/material";
import { GridRenderCellParams } from "@mui/x-data-grid";
import React from "react";
import { lookup } from "../../logic/autocomplete.logic";
import { AuthContext } from "../navigation/AuthProvider";

interface Props {
  dbOption:
    | "customer"
    | "supplier"
    | "inventory-stock"
    | "inventory" // all products and materials
    | "material" // not for sale
    | "raw-mat" //is raw, not for sale
    | "non-raw-mat" //is not raw, not for sale
    | "product" //for sale
    | "approved-product" //approved and for sale
    | "approved-product-all" //for sale and not for sale, just approved that matters
    | "user"
    | "product-type"
    | "product-type-mat"
    | "location"
    | "product-type-raw"
    | "container";
  handleEditRow: (id: string, newItem: any) => void;
  readOnly?: boolean;
  rowParams: any;
  initialValue: any;
  letterMin: number;
  getOptionLabel: (option: any) => any;
  width?: number;
  dropDownWidth?: number;
}

const TableAutocomplete: React.FC<Props> = ({
  handleEditRow,
  rowParams,
  initialValue,
  letterMin,
  dbOption,
  width = 340,
  dropDownWidth = 450,
  getOptionLabel,
  readOnly = false,
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
  const handleSelect = async (value: string) => {
    lookup(value.toUpperCase(), dbOption, letterMin).then((result) => {
      setOptionList(result);
    });
  };

  if (editMode) {
    return (
      <Autocomplete
        value={initialValue}
        clearOnBlur={false}
        isOptionEqualToValue={(option, value) =>
          option._id === value._id || option.lot_number === value
        }
        filterOptions={(x) => x}
        openOnFocus
        selectOnFocus
        onFocus={() => {
          handleSelect(initialValue);
        }}
        readOnly={readOnly}
        options={optionList}
        getOptionLabel={getOptionLabel}
        PaperComponent={({ children }) => (
          <Paper
            variant="outlined"
            style={{
              background: "#e4e6ee",
              fontSize: "16px",
              maxWidth: dropDownWidth,
              minWidth: dropDownWidth,
            }}
          >
            {children}
          </Paper>
        )}
        sx={{ width: width, height: "39px" }}
        onInputChange={handleInputChange}
        onBlur={() => setEditMode(false)}
        onChange={(event, value) => {
          console.log(value);
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
          minWidth: width,
          // minHeight: "39px",
          paddingBottom: "10px",
          padding: "10px",
          height: "100%",
        }}
        onDoubleClick={() => setEditMode(!readOnly)}
      >
        <Typography variant="subtitle2" style={{ fontSize: "15px" }}>
          {initialValue}
        </Typography>
      </div>
    );
  }
};

export default TableAutocomplete;
