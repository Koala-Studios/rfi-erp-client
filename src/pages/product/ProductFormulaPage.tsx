import React from "react";
import { Button, Card, Grid, TextField } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbar } from "@mui/x-data-grid";
import { DataTable } from "../../components/utils/DataTable";
import { listInventoryMovements } from "../../logic/inventory-movements.logic";
import { FilterElement, IListData } from "../../logic/utils";
import { useLocation, useNavigate, useSearchParams, useParams } from "react-router-dom";
import { AuthContext } from "../../components/navigation/AuthProvider";
import { getFormula } from "../../logic/formula.logic";
import { ObjectID } from "bson";

//label,field,type
const filterArray: FilterElement[] = [
  { label: "Item Name", field: "name", type: "text" },
  {
    label: "Item Code",
    field: "product_code",
    type: "text",
    regexOption: null,
  },
];
export const ProductFormulaPage = () => { //WILL BE USED FOR BOTH MATERIALS AND PRODUCTS!

  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const auth = React.useContext(AuthContext);
  const [loadedVersion, setloadedVersion] = React.useState<number>(0);
  const [formula, setFormula] = React.useState<any>(null);
  const [rows, setRows] = React.useState<any>(null);
  const [currPage, setCurrPage] = React.useState<number>(1);

  const columns: GridColDef[] = [
    { field: "material_code", headerName: "Mat Code", width: 120 },
    { field: "material_name", headerName: "Mat Name", width: 350 },
    { field: "amount", headerName: "Qty", width: 150 },
    { field: "cost", headerName: "Cost", width:120, align:"center"},
    { field: "notes", headerName: "Notes", width: 350, align: "center" },
  ];

  React.useEffect(() => {
    getFormula(id!).then((formula) => {
    
      const newRows =  formula!.formula_items.map((item) => {
        return {...item, id: new ObjectID().toHexString(), cost: (item.cost*item.amount/100).toFixed(4)}
    }
      )
      setloadedVersion(formula!.version)
      console.log(newRows)
      setFormula(formula)
      setRows(newRows);
    });
  }, [currPage, location.key]);

  if (rows == null) return null;

  return <>
    <Card variant="outlined" style={{ padding:16, marginBottom: 10 }}>
    <Grid container spacing={2} sx={{paddingTop:4, paddingBottom:2}}>
    <Grid item xs={0.8}>
              <TextField
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                type="number"
                label={"Version"}
                onChange={(e) => {
                  setloadedVersion(parseInt(e.target.value))
                }}
                defaultValue={loadedVersion}
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
                    if(!loadedVersion) return;
                    getFormula(id!,loadedVersion).then((formula) => {
                        const newRows =  formula!.formula_items.map((item) => {
                          return {...item, id: new ObjectID().toHexString(), cost: (item.cost*item.amount/100).toFixed(4)}
                      }
                        )
                        console.log(formula)
                        setFormula(formula)
                        setRows(newRows);
                    });
                }}
              >
                Load
              </Button>
            </Grid>
    </Grid>
    <Grid container spacing={2} sx={{ paddingBottom:2}}>
    <Grid item xs={1}>
    <h3>Base(%): {formula.base}</h3>
            </Grid>
            <Grid item xs={1}>
            <h3>Yield: {formula.yield.toFixed(2)}</h3>
            </Grid>
            <Grid item xs={1}>
            <h3>Rec Dose: {formula.rec_dose_rate}</h3>
            </Grid>
            <Grid item xs={1}>
            <h3>Version: {formula.version}</h3>
            </Grid>
            <Grid item xs={3}></Grid>
            <Grid item xs={3}>

            </Grid>
            </Grid>
    <DataGrid
        rows={rows}
        columns={columns}
        density={'compact'}
        components={{Toolbar:GridToolbar}}
        autoHeight={true}
      ></DataGrid>
    </Card>
  </>;
};

export default ProductFormulaPage;