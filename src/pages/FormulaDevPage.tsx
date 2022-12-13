import React from "react";
import { DataTable } from "../components/utils/DataTable";
import { GridColDef, GridRenderCellParams, GridValueGetterParams } from "@mui/x-data-grid";
import { AuthContext } from "../components/navigation/AuthProvider";
import { getFormula } from "../logic/formula.logic";
import { useNavigate, useParams } from "react-router-dom";
import { Autocomplete, Card, TextField } from "@mui/material";
import { lookupInventory } from "../logic/inventory.logic";



const FormulaDevPage = () => {
const columns: GridColDef[] = [
  // { field: "id", headerName: "ID", width: 300 },
  // { field: "date", headerName: "Date Created", width: 250 },
  { field: "material_code", headerName: "Material Code", width: 300,
  renderCell: (params: GridRenderCellParams<string>) => (
      <Autocomplete
  disablePortal
  id="combo-box-demo"
  options={['this has to be','filled by results', 'of filterChanges function']}
  sx={{ width: 300 }}
  onInputChange={(event, newInputValue) => {
    if(newInputValue.length > 4) {
    const test = filterChanges(newInputValue.toUpperCase());
    console.log(newInputValue, test, 'asdapuja')
    }
  }}
  renderInput={(params) => <TextField

    {...params} label="Material Code" />
  }
    />
  ),
    },
  { field: "material_name", headerName: "Material Name", width: 300 },
  { field: "quantity", headerName: "Qty(%)", type: "number", width: 90, editable:true },
  { field: "cost", headerName: "Cost($)", type: "number", width: 100 },
  { field: "notes", headerName: "Notes", type: "string", width: 400, editable:true },
  
];


const auth = React.useContext(AuthContext);

function filterChanges(string: string) {
        const test = lookupInventory(auth.token, string).then((result) => {
            console.log(result)
        });
        return test;
    };


  const [rows, setRows] = React.useState<any>(null);
  const { id } = useParams();
  const { version } = useParams();
  // const { approved_version } = useParams();
  React.useEffect(() => {
    getFormula(auth.token, id!, version! ).then((formula) => {
      console.log(formula,' TEST')
      if(!formula?.formula_items) {
        setRows({});
      } else {
        const newRows = formula!.formula_items.map((item) => {
          return {
            id: item.material_id,
            material_code: item.material_code,
            material_name: item.material_name,
            cost: item.cost * (item.amount/100),
            quantity: item.amount,
            notes: item.notes,
          };
        });
        setRows(newRows);
      }

    });
  }, []);

  if (rows == null) return null;

return (
  <Card variant="outlined" sx={{ padding: 3, overflowY: 'auto' }}>
    
    <DataTable  auto_height={true} rows={rows!} columns={columns}></DataTable>
  </Card> );
};


export default FormulaDevPage;
