import React from "react";
import { DataTable } from "../components/utils/DataTable";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { AuthContext } from "../components/navigation/AuthProvider";
import { getFormula, submitFormula } from "../logic/formula.logic";
import { useNavigate, useParams } from "react-router-dom";
import {
  Autocomplete,
  Button,
  Card,
  Checkbox,
  FormControlLabel,
  Grid,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { IInventory, lookupInventory } from "../logic/inventory.logic";
import { getProduct } from "../logic/product.logic";
import { Field } from "formik";
import { IFormula, IFormulaItem } from "../logic/formula.logic";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import RemoveOutlinedIcon from "@mui/icons-material/RemoveOutlined";
import { apiStatus } from "../logic/utils";
import { fireEvent } from "@testing-library/react";
import TableAutocomplete from "../components/utils/TableAutocomplete";
import { IProduct } from "../logic/product.logic";
import WarningIcon from "@mui/icons-material/Warning";

const FormulaDevPage = () => {
  const navigate = useNavigate();
  const [invLookupCatalog, setInvLookupCatalog] = React.useState<any>(null);
  const auth = React.useContext(AuthContext);
  const [rowCount, setRowCount] = React.useState<any>(0);
  const [cost, setCost] = React.useState<number>(0);
  const [multiplier, setMultiplier] = React.useState<number>(1.0);
  const [totalAmt, setTotalAmt] = React.useState<number>(0);
  const [rows, setRows] = React.useState<any>(null);
  const [editMode, setEditMode] = React.useState<string | null>(null);
  const [carrier, setCarrier] = React.useState<string | null>(null);

  const [base100, setBase100] = React.useState<boolean>(true);
  const [prodYield, setYield] = React.useState<number>(1.0);

  const [changedYield, setChangedYield] = React.useState<boolean>(true);
  const [approveonSubmit, setApproveonSubmit] = React.useState<boolean>(false);

  const { id } = useParams();
  const { version } = useParams();
  React.useEffect(() => {
    getFormula(id!, version!).then((formula) => {
      setYield(formula!.yield ? formula!.yield : 1.0);
      setBase100(formula!.base_hundred ? formula!.base_hundred : true);
      if (!formula?.formula_items) {
        setRows([
          {
            id: "row" + rowCount,
            amount: 0,
            last_amount: 0,
            item_cost: 0,
            cost: 0,
          },
        ]);
        setRowCount(rowCount + 1);
      } else {
        let count = 0;
        let amount = 0;
        const newRows = formula!.formula_items.map((item, index) => {
          return {
            id: item.material_id + "" + count++,
            material_id: item.material_id,
            material_code: item.material_code,
            material_name: item.material_name,
            item_cost: item.cost,
            cost: 0,
            amount: 0,
            last_cost: (item.cost * item.amount) / 100,
            last_amount: item.amount,
            notes: item.notes,
          };
        });
        setRows(newRows);
        setRowCount(count);
      }
    });
  }, []);

  const [product, setProduct] = React.useState<IProduct | null>(null);

  React.useEffect(() => {
    getProduct(id!).then((product) => {
      setProduct(product);
    });
  }, []);

  React.useEffect(() => {
    handleSetCost();
    console.log(totalAmt);
  }, [rows]);

  React.useEffect(() => {
    //Temporary method of adjusting carrier amt, other methods would cause infinite recursion atm
    handleCalcCarrier();
  }, [cost]);

  React.useEffect(() => {
    if (carrier != null) {
      handleCalcCarrier();
    }
  }, [carrier]);

  interface IFormulaDevRow extends IFormulaItem {
    id: string;
    last_cost: number | null;
    item_cost: number | null;
    last_amount: number;
  }

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "Actions",
      align: "left",
      width: 135,
      renderCell: (params: GridRenderCellParams<string>) => (
        <strong>
          <Button
            variant="outlined"
            color="error"
            size="small"
            style={{
              backgroundColor: "#ff221115",
              fontSize: "25px",
              maxWidth: "40px",
              maxHeight: "30px",
              minWidth: "40px",
              minHeight: "30px",
              marginRight: "12px",
            }}
            onClick={() => handleDeleteRow(params.row.id)}
          >
            -
          </Button>
          <Button
            variant="outlined"
            color="info"
            size="small"
            style={{
              backgroundColor: "#1144ff15",
              fontSize: "19px",
              maxWidth: "40px",
              maxHeight: "30px",
              minWidth: "40px",
              minHeight: "30px",
            }}
            onClick={() => handleAddRow(params.row.id)}
          >
            +
          </Button>
          <Checkbox
            disabled={carrier != null && carrier != params.row.id}
            checked={carrier === params.row.id}
            onClick={() => {
              setCarrier(carrier === null ? params.row.id : null);
            }}
          />
        </strong>
      ),
    },
    {
      field: "material_code",
      headerName: "Mat Code",
      width: 90,
      align: "right",
      sortable: false,
      filterable: false,
    },
    {
      field: "material_name",
      headerName: "Mat Name",
      width: 340,
      sortable: false,
      filterable: false,
      renderCell: (row_params: GridRenderCellParams<string>) => (
        <TableAutocomplete
          dbOption="inventory"
          // editMode={editMode}
          // setEditMode={setEditMode}
          handleEditRow={handleEditRow}
          rowParams={row_params}
          initialValue={row_params.row.material_name}
          letterMin={3}
          getOptionLabel={(item: IInventory) =>
            `${item.product_code} | ${item.name}`
          }
        />
      ),
    },
    {
      field: "item_cost",
      headerName: "Mat Cost/KG",
      type: "number",
      sortable: false,
      filterable: false,
      width: 100,
      align: "left",
    },
    {
      field: "amount",
      headerName: "Qty(%)",
      type: "number",
      width: 90,
      editable: true,
      sortable: false,
      align: "left",
      valueGetter: (params) =>
        params.row.amount === 0 ? null : params.row.amount,
    },
    {
      field: "cost",
      headerName: "Cost",
      type: "number",
      width: 100,
      sortable: false,
      filterable: false,
      align: "right",
      valueGetter: (params) =>
        params.row.amount === 0
          ? null
          : (params.row.item_cost * params.row.amount) / 100,
    },
    {
      field: "last_amount",
      headerName: "Prev Qty(%)",
      type: "number",
      sortable: false,
      filterable: false,
      width: 90,
      align: "right",
      valueGetter: (params) => params.row.last_amount,
    },
    {
      field: "last_cost",
      headerName: "Prev Cost",
      type: "number",
      sortable: false,
      filterable: false,
      width: 100,
      valueGetter: (params) => params.row.last_cost,
    },

    {
      field: "notes",
      headerName: "Notes",
      type: "string",
      sortable: false,
      filterable: false,
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
        amount: 0,
        last_amount: 0,
        item_cost: 0,
        cost: 0,
      },
      ...rows.slice(index == rows.length - 1 ? index + 2 : index + 1),
    ]);
    setRowCount(rowCount + 1);
    // setEditMode("row" + rowCount); //onBlur in autocomplete clashes with this, also slows page down
  };

  const handleMultiplier = (mult_amount: number) => {
    setRows(
      rows.map((material: IFormulaDevRow, index: number) => {
        if (material.id != carrier) {
          material.amount = material.amount
            ? material.amount * mult_amount
            : material.last_amount * mult_amount;
        }
        console.log(material.amount, mult_amount);
        return material;
      })
    );
  };
  const handleEditRow = (row_id: string, newRow: IFormulaDevRow) => {
    const rowIndex = rows.findIndex((r: IFormulaDevRow) => r.id === row_id);

    setRows([
      ...rows.slice(0, rowIndex),
      newRow,
      ...rows.slice(rowIndex == rows.length ? rowIndex : rowIndex + 1),
    ]);
  };

  const handleEditCell = (row_id: string, field: string, value: any) => {
    const rowIndex = rows.findIndex((r: IFormulaDevRow) => r.id === row_id);
    setRows([
      ...rows.slice(0, rowIndex),
      {
        ...rows[rowIndex],
        [field]: value,
      },
      ...rows.slice(rowIndex == rows.length ? rowIndex : rowIndex + 1),
    ]);
  };

  const handleDeleteRow = (row_id: string) => {
    if (row_id === carrier) {
      setCarrier(null);
    }
    setRows([...rows.filter((m: IFormulaDevRow) => m.id !== row_id)]);
  };

  const handleSetCost = () => {
    if (rows) {
      setTotalAmt(
        rows
          // @ts-ignore
          .reduce((a, b) => a + (!b.amount ? b.last_amount : b.amount), 0)
          .toFixed(2)
      );
      setCost(
        rows
          .reduce(
            // @ts-ignore
            (a, b) =>
              a + ((!b.amount ? b.last_amount : b.amount) * b.item_cost) / 100,
            0
          )
          .toFixed(2)
      );
    }
  };

  const handleCalcCarrier = () => {
    if (rows && carrier != null) {
      let totalMat = 0;
      for (var i = 0; i < rows.length; i++) {
        if (rows[i].id != carrier) {
          totalMat += rows[i].amount ? rows[i].amount : rows[i].last_amount;
        }
      }
      handleEditCell(carrier, "amount", totalMat < 100 ? 100 - totalMat : NaN);
    }
  };

  const handleSubmit = async () => {
    const newVersion: IFormula = {
      product_code: product!.product_code,
      formula_items: rows.map((material: IFormulaDevRow) => {
        return {
          material_code: material.material_code,
          amount: material.amount ? material.amount : material.last_amount,
          notes: material.notes,
          material_id: material.material_id,
          material_name: material.material_name,
        };
      }),
      product_id: product!._id,
      yield: prodYield,
      base_hundred: base100,
    };
    //TODO: WHOLE PAGE NEEDS SLIGHT REWORK LOL.
    const new_formula = await submitFormula(approveonSubmit, newVersion);

    if (new_formula) {
      navigate(`/formulas/develop/${new_formula._id}/${version ?? 0 + 1}`, {
        replace: true,
      });
    }
  };

  function filterChanges(str: string) {
    lookupInventory(str, false).then((result) => {
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
      <Card variant="outlined" style={{ padding: 16, marginBottom: 10 }}>
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
            <Grid item xs={5}></Grid>

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

          <Card variant="outlined" style={{ width: "40%", minWidth: "40%" }}>
            <div>
              <Typography variant="h6">Overview Stats</Typography>
            </div>
          </Card>
        </div>
      </Card>
      <Card variant="outlined" sx={{ padding: 3, overflowY: "auto" }}>
        {/*FORMULA DEV SECTION*/}
        <div style={{ display: "flex", paddingBottom: 16 }}>
          <Grid container spacing={2}>
            <Grid item xs={1.5}>
              <Button variant="contained" size="medium">
                Import Formula
              </Button>
            </Grid>
            <Grid item xs={0.8}>
              <TextField
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Mult"}
                onChange={(e) => {
                  setMultiplier(
                    e.target.value ? parseFloat(e.target.value) : 1
                  );
                }}
                // InputProps={{
                //   readOnly: true,
                // }}
              ></TextField>
            </Grid>
            <Grid item xs={1.5}>
              <Button
                variant="contained"
                size="medium"
                onClick={(e) => {
                  handleMultiplier(multiplier);
                }}
              >
                Apply
              </Button>
            </Grid>
            <Grid item xs={1}>
              <FormControlLabel
                control={
                  <Checkbox
                    onClick={() => {
                      if (base100) {
                      } /* <-- this portion doesn't work atm because of field below*/
                      setBase100(!base100);
                    }}
                    checked={base100}
                  />
                }
                label="Base100?"
              />
            </Grid>
            <Grid item xs={0.75}>
              <TextField
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Yield Ratio"}
                defaultValue={prodYield.toFixed(2)}
                onChange={(e) => {
                  setYield(parseFloat(e.target.value));
                }} //here
              ></TextField>
            </Grid>
            <Grid item xs={1.2}></Grid>
            <Grid item xs={1.75}>
              <FormControlLabel
                control={
                  <Checkbox
                    onClick={() => {
                      setApproveonSubmit(!approveonSubmit);
                    }}
                    checked={approveonSubmit}
                  />
                }
                label="Approve?"
              />
              <Button
                variant="contained"
                size="medium"
                onClick={() => handleSubmit()}
              >
                Submit
              </Button>
            </Grid>
            <Grid item xs={0.5}>
              <div hidden={!(prodYield === 1 && totalAmt > 100)}>
                <Tooltip
                  placement="top"
                  title="The total surpasses 100 & the yield is set to 1.00"
                >
                  <WarningIcon sx={{ color: "orange" }} />
                </Tooltip>
              </div>
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
              switch (event.code) {
                case "Escape": {
                  setEditMode(null);
                  break;
                }
                // case("Enter"):
                // {
                //   console.log('test', event, params )
                //   break;
                // }
                case "ArrowDown":
                case "ArrowUp":
                case "Backspace": {
                  event.stopPropagation();
                }
              }
            } else {
              // if( event.code == "Enter")
              // {
              //   // console.log(event, params)
              // }
            }
          }}
          onCellEditCommit={(e, value) => {
            handleEditCell(e.id.toString(), e.field, e.value);
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
