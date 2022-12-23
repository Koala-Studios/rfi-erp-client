import React from "react";
import { DataTable } from "../components/utils/DataTable";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { AuthContext } from "../components/navigation/AuthProvider";
import { getFormula } from "../logic/formula.logic";
import { useNavigate, useParams } from "react-router-dom";
import {
  Autocomplete,
  Button,
  Card,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { lookupInventory } from "../logic/inventory.logic";
import { Field } from "formik";
import { IFormula, IFormulaItem } from "../logic/formula.logic";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import RemoveOutlinedIcon from "@mui/icons-material/RemoveOutlined";
import { apiStatus } from "../logic/utils";
import { fireEvent } from "@testing-library/react";

const FormulaDevPage = () => {
  const [invLookupCatalog, setInvLookupCatalog] = React.useState<any>(null);
  const auth = React.useContext(AuthContext);
  const [rowCount, setRowCount] = React.useState<any>(0);
  const [rows, setRows] = React.useState<any>(null);
  const [editMode, setEditMode] = React.useState<string | null>(null);
  const { id } = useParams();
  const { version } = useParams();
  // const { approved_version } = useParams();
  React.useEffect(() => {
    getFormula(auth.token, id!, version!).then((formula) => {
      // console.log(formula,' TEST')
      if (!formula?.formula_items) {
        setRows({});
      } else {
        const newRows = formula!.formula_items.map((item) => {
          return {
            id: item.material_id,
            material_id: item.material_id,
            material_code: item.material_code,
            material_name: item.material_name,
            item_cost: item.cost,
            cost: null,
            amount: null,
            last_cost: item.cost,
            last_amount: item.amount,
            notes: item.notes,
          };
        });

        setRows(newRows);
      }
    });
  }, []);

  interface IFormulaDevRow extends IFormulaItem {
    id: number;
    last_cost: number | null;
    item_cost: number | null;
    last_amount: number | null;
  }

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "Actions",
      align: "left",
      width: 120,
      renderCell: (params: GridRenderCellParams<string>) => (
        <strong>
          <Button
            variant="contained"
            color="error"
            size="small"
            style={{
              backgroundColor: "rgba(182,85,80,0.94)",
              fontSize: "18px",
              color: "black",
              maxWidth: "40px",
              maxHeight: "30px",
              minWidth: "40px",
              minHeight: "30px",
              marginRight: "10px",
            }}
            onClick={() => handleDeleteRow(params.row.id)}
          >
            -
          </Button>
          <Button
            variant="outlined"
            color="success"
            size="small"
            style={{
              backgroundColor: "rgba(102,182,80,0.94)",
              fontSize: "14px",
              color: "black",
              maxWidth: "40px",
              maxHeight: "30px",
              minWidth: "40px",
              minHeight: "30px",
            }}
            onClick={() => handleAddRow(params.row.id)}
          >
            +
          </Button>
        </strong>
      ),
    },
    {
      field: "material_code",
      headerName: "Mat Code",
      width: 90,
      align: "right",
    },
    {
      field: "material_name",
      headerName: "Mat Name",
      width: 320,
      renderCell: (row_params: GridRenderCellParams<string>) => (
        <Autocomplete
          clearOnBlur={true}
          id="combo-box-demo"
          filterOptions={(x) => x}
          options={invLookupCatalog ? invLookupCatalog : []}
          PaperComponent={({ children }) => (
            <Paper style={{ background: "#eeeee4" }}>{children}</Paper>
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
                id: row_params.row.id,
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
              row_params.value = value_obj.material_name;
            } else {
              console.log("dud");
            }

            setEditMode(null);
          }}
          renderInput={(params) => {
            if (editMode === row_params.row.id) {
              return (
                <TextField
                  variant="filled"
                  autoFocus
                  value={""}
                  // onChange={(value) => {

                  //   setEditMode(false);
                  // }}
                  placeholder={row_params.row.material_name}
                  {...params}
                />
              );
            } else {
              // <Typography></Typography>
              return (
                <div
                  style={{ minWidth: "100%", minHeight: "100%" }}
                  onDoubleClick={() => setEditMode(row_params.row.id)}
                >
                  <Typography variant="subtitle2">
                    {row_params.row.material_name}
                  </Typography>
                </div>
              );
            }
          }}
        />
      ),
    },
    {
      field: "amount",
      headerName: "Qty(%)",
      type: "number",
      width: 90,
      editable: true,
    },
    {
      field: "cost",
      headerName: "Cost",
      type: "number",
      width: 100,
      valueGetter: (params) => params.row.item_cost * params.row.amount,
    },
    {
      field: "last_amount",
      headerName: "Prev Qty(%)",
      type: "number",
      width: 90,
    },
    {
      field: "last_cost",
      headerName: "Prev Cost",
      type: "number",
      width: 100,
      valueGetter: (params) => params.row.last_cost * params.row.last_amount,
    },
    {
      field: "item_cost",
      headerName: "Mat Cost/KG",
      type: "number",
      width: 100,
    },
    {
      field: "notes",
      headerName: "Notes",
      type: "string",
      width: 400,
      editable: true,
    },
  ];

  const handleAddRow = (row_id: number) => {
    const index = rows.findIndex(
      (element: IFormulaDevRow) => element.id == row_id
    );
    setRows([
      ...rows.slice(0, index + 1),
      {
        id: "row" + rowCount,
      },
      ...rows.slice(index == rows.length - 1 ? index + 2 : index + 1),
    ]);
    setRowCount(rowCount + 1);
    setEditMode("row" + rowCount);
    console.log(rows);
  };

  const handleEditRow = (newRow: IFormulaDevRow) => {
    const rowIndex = rows.findIndex((r: IFormulaDevRow) => r.id === newRow.id);

    setRows([
      ...rows.slice(0, rowIndex),
      newRow,
      ...rows.slice(rowIndex == rows.length - 1 ? rowIndex : rowIndex + 1),
    ]);
  };

  const handleDeleteRow = (row_id: number) => {
    setRows(rows.filter((m: IFormulaDevRow) => m.id !== row_id));
  };

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

  if (rows == null) return null;

  return (
    <>
      {/* <Card variant="outlined">
    <TextField type='number'></TextField>
  </Card> */}
      <Card variant="outlined" sx={{ padding: 3, overflowY: "auto" }}>
        <DataGrid
          onCellKeyDown={(params, event) => {
            if (event.code == "Space") {
              event.stopPropagation();
            }
          }}
          autoHeight={true}
          rows={rows!}
          columns={columns}
        ></DataGrid>
      </Card>
    </>
  );
};
export default FormulaDevPage;
