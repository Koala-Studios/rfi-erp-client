import React from "react";
import { DataTable } from "../../components/utils/DataTable";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { AuthContext } from "../../components/navigation/AuthProvider";
import { getFormula, submitFormula } from "../../logic/formula.logic";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Card,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { IInventory } from "../../logic/inventory.logic";
import { getProduct } from "../../logic/product.logic";
import { IFormula, IFormulaItem } from "../../logic/formula.logic";
import TableAutocomplete from "../../components/utils/TableAutocomplete";
import { IProduct } from "../../logic/product.logic";
import WarningIcon from "@mui/icons-material/Warning";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { ObjectID } from "bson";
const FormulaDevPage = () => {
  const navigate = useNavigate();
  const auth = React.useContext(AuthContext);
  const [cost, setCost] = React.useState<number>(0);
  const [multiplier, setMultiplier] = React.useState<number>(1.0);
  const [totalAmt, setTotalAmt] = React.useState<number>(0);
  const [rows, setRows] = React.useState<any>(null);
  const [editMode, setEditMode] = React.useState<string | null>(null);
  const [carrier, setCarrier] = React.useState<string | null>(null);

  const [base100, setBase100] = React.useState<boolean>(true);
  const [prodYield, setYield] = React.useState<number>(1.0);
  const [recDose, setRecDose] = React.useState<number>(0.2);
  const [product, setProduct] = React.useState<IProduct | null>(null);

  const [approveonSubmit, setApproveonSubmit] = React.useState<boolean>(false);

  const { id } = useParams();
  const { version } = useParams();

  const ProductStatus = [
    ["Pending", "error"],
    ["In Progress", "warning"],
    ["Awaiting Approval", "info"],
    ["Approved", "success"],
    ["Error", "error"],
  ];

  React.useEffect(() => {
    getProduct(id!).then((product) => {
      setProduct(product);
    });
    getFormula(id!, version!).then((formula) => {
      if(formula){ 

        setYield(formula!.yield ? formula!.yield : 1.0);
        setBase100(formula!.base_hundred ? formula!.base_hundred : true);
        setRecDose(formula!.rec_dose_rate ? formula!.rec_dose_rate : NaN);
        if (!formula?.formula_items) {
          setRows([
            {
              _id: new ObjectID().toHexString(),
              amount: 0,
              last_amount: 0,
              item_cost: 0,
              cost: 0,
            },
          ]);
        } else {
          let count = 0;
          let amount = 0;
          const newRows = formula!.formula_items.map((item, index) => {
            return {
              _id: new ObjectID().toHexString(),
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
        }
      } else {
        setYield(1);
        setBase100(true);
        setRows([{_id:new ObjectID().toHexString(), material_id: null, material_code: null, material_name: '', item_cost: 0, amount: 0, last_cost:0,last_amount: null, notes: ''}]);
      }
    });
  }, []);

  React.useEffect(() => {
    handleSetCost();
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
    _id: string;
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
            onClick={() => handleDeleteRow(params.row._id)}
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
            onClick={() => handleAddRow(params.row._id)}
          >
            +
          </Button>
          <Checkbox
            disabled={carrier != null && carrier != params.row._id}
            checked={carrier === params.row._id}
            onClick={() => {
              setCarrier(carrier === null ? params.row._id : null);
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
          dbOption="material"
          readOnly={row_params.row.last_amount != null}
          // editMode={editMode}
          // setEditMode={setEditMode}
          handleEditRow={handleEditRow}
          rowParams={row_params}
          initialValue={row_params.row.material_name}
          letterMin={2}
          getOptionLabel={(item: IInventory) =>
            `${item.product_code} | ${item.name}`
          }
        />
      ),
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
    {
      field: "item_cost",
      headerName: "Mat Cost/KG",
      type: "number",
      sortable: false,
      filterable: false,
      width: 100,
      align: "left",
    },
  ];

  const handleAddRow = (row_id: string) => {
    const index = rows.findIndex(
      (element: IFormulaDevRow) => element._id === row_id
    );
    setRows([
      ...rows.slice(0, index + 1),
      {
        _id: new ObjectID().toHexString(),
        amount: 0,
        last_amount: null,
        item_cost: 0,
        cost: 0,
      },
      ...rows.slice(index == rows.length - 1 ? index + 2 : index + 1),
    ]);
    // setEditMode("row" + rowCount); //onBlur in autocomplete clashes with this, also slows page down
  };

  const handleMultiplier = (mult_amount: number) => {
    setRows(
      rows.map((material: IFormulaDevRow, index: number) => {
        if (material._id != carrier) {
          material.amount = material.amount
            ? material.amount * mult_amount
            : material.last_amount * mult_amount;
        }
        console.log(material.amount, mult_amount);
        return material;
      })
    );
    
  };

  const handleEditRow = (rowid: string, value: any) => {
    const rowIndex = rows.findIndex((r: IFormulaDevRow) => r._id === rowid);

    let pList = rows.slice();
    console.log(rowid, value, rowIndex, pList[rowIndex]);
    pList[rowIndex].material_code = value.product_code;
    pList[rowIndex].product_id = value._id;
    pList[rowIndex].material_name = value.name;
    pList[rowIndex].item_cost = value.cost;

    setRows(pList);

  };

  const handleEditCell = (row_id: string, field: string, value: any) => {
    const rowIndex = rows.findIndex((r: IFormulaDevRow) => r._id === row_id);
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
    setRows([...rows.filter((m: IFormulaDevRow) => m._id !== row_id)]);

    
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
        if (rows[i]._id != carrier) {
          totalMat += rows[i].amount ? rows[i].amount : rows[i].last_amount;
        }
      }
      handleEditCell(carrier, "amount", totalMat < 100 ? 100 - totalMat : NaN);
    }

    
  };

  const handleAdminApprove = async () => {
    
    // const new_formula = await submitFormula(approve, newVersion);
  }
  const handleSubmit = async (approve:boolean = false) => {
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
      rec_dose_rate: recDose
    };
    //TODO: WHOLE PAGE NEEDS SLIGHT REWORK LOL.
    const _product = await submitFormula(approve, newVersion);

    if (_product) {
      navigate(`/formulas/develop/${_product._id}/${_product.versions ?? 1}`, {
        replace: true,
      });
    }
  };

  // function filterChanges(str: string) {
  //   lookupInventory(str, false).then((result) => {
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
  //     setInvLookupCatalog(newCatalog);
  //   });
  // }

  if (rows == null) return null;

  return (
    <>
      <Card variant="outlined" style={{ padding: 16, marginBottom: 10 }}>
      <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 100,
            marginBottom: 10,
          }}
      >
      <div>
      <Button
          sx={{ mb: 3 }}
          aria-label="go back"
          size="medium"
          variant="outlined"
          onClick={() => navigate(-1)}
        >
          <ArrowBackIcon fontSize="small" />
        </Button>
        
        <Grid sx={{ maxWidth: "85%" }} container spacing={3}>
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
                value={product?.product_code}
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
                value={product?.name}
              ></TextField>
            </Grid>
            <Grid item xs={1.5}></Grid>
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
                value={product?.versions}
              ></TextField>
            </Grid>
            <Grid item xs={2}>
            <Chip
                  label={
                    ProductStatus[
                      product?.status ? product?.status - 1 : 4
                    ][0]
                  }
                  sx={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 10,
                    fontWeight: 600,
                  }}
                  //@ts-ignore
                  color={
                    ProductStatus[
                      product?.status ? product?.status - 1 : 4
                    ][1]
                  }
                  variant="outlined"
                />
            </Grid>
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
                value={product?.date_created}
              ></TextField>
            </Grid>
            <Grid item xs={2.5}>
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
                value={product?.date_created}
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
                value={product?.description}
              ></TextField>
            </Grid>
          </Grid>

          </div>
          
          <Card
            variant="outlined"
            style={{
              width: 260,
              minWidth: 260,
              padding: 16,
              display: "flex",

              flexDirection: "column",
              gap: 12,
            }}
          >
            <div>
              <Typography variant="h6">Action Board</Typography>
            </div>
            <Divider></Divider>
            <Button
              style={{
                // display: `${purchase.status === 6 ? "box" : "none"}`,
              }}
              disabled={id === "new" || (product!.status != 1 && product!.status != 2)}
              variant="contained"
              onClick={() => handleSubmit(false)}
            >
              SUBMIT
            </Button>

            <Button
              color="info"
              variant="contained"
              disabled={id === "new" || product!.status != 2}
              onClick={() => handleSubmit(true)}
            >
              APPROVE & SUBMIT
            </Button>
            <Button
              color="success"
              variant="contained"
              disabled={id === "new" || product!.status != 3}
              onClick={() => handleAdminApprove()}
            >
              APPROVE
            </Button>
            <Button
              color="warning"
              variant="contained"
              disabled={id === "new" || product!.status != 3}
              onClick={() => handleAdminApprove()}
            >
              DISAPPROVE / REDRAFT
            </Button>
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
                onBlur={(e) => {
                  setYield(parseFloat(e.target.value));
                }} //here
              ></TextField>
            </Grid>
            <Grid item xs={1.2}></Grid>
            <Grid item xs={0.75}>
              <TextField
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Rec Dose"}
                defaultValue={recDose.toFixed(2)}
                type="number"
                onBlur={(e) => {
                  console.log(e, 'test dose')
                  setRecDose(parseFloat(e.target.value));
                }} //here
              ></TextField>
            </Grid>
            <Grid item xs={1.2}></Grid>
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
          getRowId={(row) => row._id}
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
          experimentalFeatures={{ newEditingApi: true }}
          processRowUpdate={(newRow) => {
            let pList = rows.slice();
            const rowIdx = rows.findIndex((r:any) => r._id === newRow._id);
            pList[rowIdx] = newRow;
            setRows(pList);
            return newRow;
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
