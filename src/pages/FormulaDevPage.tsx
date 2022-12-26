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
  Grid,
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
import GenericAutocomplete from "../components/utils/GenericAutocomplete";

const FormulaDevPage = () => {
  const [invLookupCatalog, setInvLookupCatalog] = React.useState<any>(null);
  const auth = React.useContext(AuthContext);
  const [rowCount, setRowCount] = React.useState<any>(0);
  const [cost,setCost] = React.useState<number>(0);
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
            cost: 0,
            amount: 0,
            last_cost: item.cost*item.amount/100,
            last_amount: item.amount,
            notes: item.notes,
          };
        });

        setRows(newRows);
      }
    });
  }, []);

  React.useEffect(() => {
    handleSetCost()
  },[rows])

  interface IFormulaDevRow extends IFormulaItem {
    id: string;
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
      sortable: false,
      filterable:false
    },
    {
      field: "material_name",
      headerName: "Mat Name",
      width: 340,
      sortable: false,
      filterable:false,
      renderCell: (row_params: GridRenderCellParams<string>) => (
        <GenericAutocomplete
          editMode={editMode}
          setEditMode={setEditMode}
          handleEditRow={handleEditRow}
          rowParams={row_params}
        />
      ),
    },
    {
      field: "item_cost",
      headerName: "Mat Cost/KG",
      type: "number",
      sortable: false,
      filterable:false,
      width: 100,
      align:'left'
    },
    {
      field: "amount",
      headerName: "Qty(%)",
      type: "number",
      width: 90,
      editable: true,
      sortable: false,
      align:'left',
      valueGetter: (params) => params.row.amount === 0  ? null : params.row.amount
    },
    {
      field: "cost",
      headerName: "Cost",
      type: "number",
      width: 100,
      sortable: false,
      filterable:false,
      align:'right',
      valueGetter: (params) =>  params.row.amount === 0  ? null : params.row.item_cost * params.row.amount,
    },
    {
      field: "last_amount",
      headerName: "Prev Qty(%)",
      type: "number",
      sortable: false,
      filterable:false,
      width: 90,
      align:'right',
      valueGetter: (params) => params.row.last_amount
    },
    {
      field: "last_cost",
      headerName: "Prev Cost",
      type: "number",
      sortable: false,
      filterable:false,
      width: 100,
      valueGetter: (params) => params.row.last_cost,
    },
    {
      field: "notes",
      headerName: "Notes",
      type: "string",
      sortable: false,
      filterable:false,
      width: 400,
      editable: true,
    },
  ];

  const handleAddRow = (row_id: string) => {
    const index = rows.findIndex(
      (element: IFormulaDevRow) => element.id === row_id
    );
    setRows([
      ...rows.slice(0, index + 1),
      {
        id: "row" + rowCount,
      },
      ...rows.slice(index == rows.length - 1 ? index + 2 : index + 1),
    ]);
    setRowCount(rowCount + 1);
    // setEditMode("row" + rowCount); //onBlur in autocomplete clashes with this, also slows page down
  };

  const handleEditRow = (row_id:string, newRow: IFormulaDevRow ) => {
    const rowIndex = rows.findIndex((r: IFormulaDevRow) => r.id === '' + row_id);

    setRows([
      ...rows.slice(0, rowIndex),
      newRow,
      ...rows.slice(rowIndex == rows.length - 1 ? rowIndex : rowIndex + 1),
    ]);
  };

  const handleEditCell = (row_id:string,field:string, value:any ) => {
    const rowIndex = rows.findIndex((r: IFormulaDevRow) => r.id === row_id);
    setRows([
      ...rows.slice(0, rowIndex),
      {
        ...rows[rowIndex],
        [field] : value
      },
      ...rows.slice(rowIndex == rows.length - 1 ? rowIndex : rowIndex + 1),
    ]);
  }

  const handleDeleteRow = (row_id: string) => {
    setRows(rows.filter((m: IFormulaDevRow) => m.id !== row_id));
  };

  const handleSetCost = () => {
    if(rows) {
      // @ts-ignore
      setCost(rows.reduce((a, b) => a + (( (b.amount === 0) ? b.last_amount:  b.amount)*b.item_cost)/100, 0).toFixed(2))
    }
  }

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
            <Card variant="outlined" style={{ padding: 16, marginBottom:10 }}>
        <div style={{ display: "flex", gap: 16 }}>
          <Grid container spacing={3}>
          <Grid item xs={2.5}>
              <TextField
                fullWidth
                InputLabelProps={{ shrink: true }}
                size="small"
                variant="outlined"
                label={"Created Date"}
                InputProps={{
                  readOnly: true,
                }}
                type={"date"}
              ></TextField>
            </Grid>
            <Grid item xs={2.5}>
              {/* <DatePicker
                label="Basic example"
                value={undefined}
                // onChange={(newValue) => {
                //   setValue(newValue);
                // }}
                renderInput={(params) => <TextField {...params} />}
              /> */}
              <TextField 
                fullWidth
                InputLabelProps={{ shrink: true }}
                size="small"
                variant="outlined"
                label={"Approved Date"}
                InputProps={{
                  readOnly: true,
                }}
                type={"date"}
              ></TextField>
            </Grid>

            <Grid item xs={3.5}></Grid>
            <Grid item xs={1.5}>
              <TextField
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Versions"}
                InputProps={{
                  readOnly: true,
                }}
              ></TextField>
            </Grid>
            <Grid item xs={2}>
              <TextField
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Status"}
                InputProps={{
                  readOnly: true,
                }}
              ></TextField>
            </Grid>
            <Grid item xs={2}>
              <TextField
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                InputProps={{
                  readOnly: true,
                }}
                label={"Product Code"}
              ></TextField>
            </Grid>
            <Grid item xs={5}>
              <TextField
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Product Name"}
                InputProps={{
                  readOnly: true,
                }}
              ></TextField>
            </Grid>
            <Grid item xs={3.8}></Grid>
            <Grid item xs={1.2}>
              <TextField
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Cost"}
                // InputProps={{
                //   readOnly: true,
                // }}
              ></TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Flavor Profile"}
                multiline
                rows={6}
              ></TextField>
            </Grid>
          </Grid>

          <Card
            variant="outlined"
            style={{ width: "40%", minWidth: "40%", padding: 16 }}
          >
            <div>
              <Typography variant="h6">Overview Stats</Typography>
            </div>
          </Card>
        </div>
      </Card>
      <Card variant="outlined" sx={{ padding: 3, overflowY: "auto" }}> {/*FORMULA DEV SECTION*/}
      <div style={{ display: "flex", gap: 16, marginBottom:15 }}>
      <Grid container spacing={3}>
            <Grid item xs={2}>
              <TextField
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                InputProps={{
                  readOnly: true,
                }}
                label={"Product Code"}
              ></TextField>
            </Grid>
            <Grid item xs={5}>
              <TextField
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Product Name"}
                InputProps={{
                  readOnly: true,
                }}
              ></TextField>
            </Grid>
            <Grid item xs={3.8}></Grid>
            <Grid item xs={1.2}>
              <TextField
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Cost"}
                //@ts-ignore
                value={cost}
                InputProps={{
                  readOnly: true,
                }}
              ></TextField>
            </Grid>
            

            </Grid>
            
      </div>
        <DataGrid
          rowHeight={39}
          hideFooter
          onCellKeyDown={(params, event) => {
            if (event.code == "Space") {
              event.stopPropagation();
            }
            if (editMode !== null) {
              switch(event.code) {
                case("Escape"):
                {
                  setEditMode(null)
                  break;
                }
                case("ArrowDown"):
                case("ArrowUp"):
                case("Backspace"):
                {
                  event.stopPropagation()
                }
              }              
            }
          }}
          onCellEditCommit={(e,value) => {
            handleEditCell(e.id.toString() ,e.field, e.value)
          }
          }
          autoHeight={true}
          rows={rows!}
          columns={columns}
        ></DataGrid>
      </Card>
    </>
  );
};
export default FormulaDevPage;
