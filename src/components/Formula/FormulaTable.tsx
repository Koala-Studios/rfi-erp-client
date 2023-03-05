import React from "react";
import { DataTable } from "../utils/DataTable";
import { GridColDef, GridValueGetterParams } from "@mui/x-data-grid";
import { getFormula } from "../../logic/formula.logic";
import { AuthContext } from "../navigation/AuthProvider";

const columns: GridColDef[] = [
  // { field: "id", headerName: "ID", width: 300 },
  { field: "product_code", headerName: "Product Code", width: 150 },
  { field: "name", headerName: "Name", width: 250 },
  { field: "status", headerName: "Status", type: "string", width: 200 },
  { field: "cost", headerName: "Cost", type: "number", width: 150 },
];

const FormulaTable = () => {
  const auth = React.useContext(AuthContext);
  const [rows, setRows] = React.useState<any>(null);

  if (rows == null) return null;

  return null;
  //return <DataTable auto_height={true} rows={rows!} columns={columns}></DataTable>;
};

export default FormulaTable;
